import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple JSON persistence for SaaS demo (Fallback)
  const DB_PATH = path.join(__dirname, 'db.json');
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      companies: [],
      users: [],
      customers: [],
      orders: [],
      products: [],
      services: [],
      finance: [],
      whatsappConfigs: {} // companyId -> { instanceName, serverUrl, apiKey }
    }, null, 2));
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const WHATSAPP_VERIFY_TOKEN_GLOBAL = process.env.WHATSAPP_VERIFY_TOKEN;

  // Helper to get companyId from request headers or DB
  const getGatewayConfig = async (companyId: string) => {
    try {
      const config = await prisma.whatsappConfig.findUnique({
        where: { companyId }
      });
      if (config) return config;
    } catch (e) {
      const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      return db.whatsappConfigs?.[companyId] || null;
    }
    return null;
  };

  // Connect / Get QR Code (Gateway)
  app.get('/api/whatsapp/connect', async (req, res) => {
    const companyId = req.query.companyId as string || 'default';
    const config = await getGatewayConfig(companyId);

    if (!config || !config.serverUrl || !config.apiKey || !config.instanceName) {
      return res.status(400).json({ error: 'Configure as credenciais do Gateway primeiro.' });
    }

    try {
      // 1. Create instance if not exists
      await axios.post(`${config.serverUrl}/instance/create`, {
        instanceName: config.instanceName,
        token: config.apiKey,
        qrcode: true
      }, { headers: { 'apikey': config.apiKey } }).catch(() => {});

      // 2. Get QR Code
      const response = await axios.get(`${config.serverUrl}/instance/connect/${config.instanceName}`, {
        headers: { 'apikey': config.apiKey }
      });
      res.json(response.data);
    } catch (error: any) {
      // Mock for local testing in AI Studio
      res.json({
        base64: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TechManagerMockConnection",
        pairingCode: "TCH-MNGR"
      });
    }
  });

  // Webhook Verification (GET)
  app.get('/api/whatsapp/webhook', (req, res) => {
    // Many gateways also use standard webhooks
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && (token === WHATSAPP_VERIFY_TOKEN_GLOBAL || token === 'tech-manager-verify')) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(200); // Standard accept
  });

  // Webhook Event Handler (Gateway POST)
  app.post('/api/whatsapp/webhook', async (req, res) => {
    const body = req.body;
    // Adapt to Evolution API webhook structure
    const eventType = body.event;
    const instance = body.instance;

    if (eventType === 'messages.upsert' && body.data?.message) {
      const msg = body.data.message;
      const from = body.data.key.remoteJid.split('@')[0];
      
      // Find company by instance
      let companyId = 'default';
      try {
        const config = await prisma.whatsappConfig.findFirst({ where: { instanceName: instance } });
        if (config) companyId = config.companyId;
      } catch(e) {}

      const newMessageData = {
        externalId: body.data.key.id,
        from: from,
        text: msg.conversation || msg.extendedTextMessage?.text || '[Mídia]',
        timestamp: new Date(),
        type: 'received',
        senderName: body.data.pushName || from,
        companyId: companyId
      };

      try {
        await prisma.whatsappMessage.create({ data: newMessageData });
        await prisma.whatsappChat.upsert({
          where: { from_companyId: { from, companyId } },
          update: { lastMessage: newMessageData.text, timestamp: new Date(), name: newMessageData.senderName },
          create: { from, name: newMessageData.senderName, lastMessage: newMessageData.text, companyId }
        });
      } catch (e) {}
    }
    return res.status(200).send('OK');
  });

  // Get Chats
  app.get('/api/whatsapp/chats', async (req, res) => {
    const companyId = req.query.companyId as string || 'default';
    try {
      const chats = await prisma.whatsappChat.findMany({
        where: { companyId },
        orderBy: { timestamp: 'desc' }
      });
      res.json(chats);
    } catch (e) {
      res.json([]);
    }
  });

  // Get Messages for a specific number
  app.get('/api/whatsapp/messages/:number', async (req, res) => {
    const { number } = req.params;
    const companyId = req.query.companyId as string || 'default';
    try {
      const messages = await prisma.whatsappMessage.findMany({
        where: {
          companyId,
          OR: [{ from: number }, { to: number }]
        },
        orderBy: { timestamp: 'asc' }
      });
      res.json(messages);
    } catch (e) {
      res.json([]);
    }
  });

  // Send Message (Gateway Integration)
  app.post('/api/whatsapp/send', async (req, res) => {
    const { to, type, content, companyId } = req.body;
    const config = await getGatewayConfig(companyId || 'default');

    if (!config || !config.serverUrl || !config.apiKey) {
      return res.status(500).json({ error: 'Configuração do Gateway não encontrada.' });
    }

    try {
      let endpoint = `${config.serverUrl}/message/sendText/${config.instanceName}`;
      let payload: any = {
        number: to,
        options: { delay: 1200, presence: "composing" }
      };

      if (type === 'text') {
        payload.text = content;
      } else if (type === 'interactive') {
        // Adapt interactive to Gateway format (Evolution Example)
        endpoint = `${config.serverUrl}/message/sendButtons/${config.instanceName}`;
        payload.buttons = content.action.buttons.map((b: any) => ({
          buttonId: b.reply.id,
          buttonText: { displayText: b.reply.title },
          type: 1
        }));
        payload.text = content.body.text;
        payload.footer = content.footer.text;
        payload.title = content.header.text;
      }

      const response = await axios.post(endpoint, payload, {
        headers: { 'apikey': config.apiKey }
      });

      const sentMsgData = {
        externalId: response.data.key.id,
        to: to,
        text: type === 'text' ? content : '[Botões]',
        timestamp: new Date(),
        type: 'sent',
        companyId: companyId || 'default'
      };
      
      try {
        await prisma.whatsappMessage.create({ data: sentMsgData });
      } catch (e) {}

      res.json(response.data);
    } catch (error: any) {
      console.error('Erro ao enviar pelo Gateway:', error.response?.data || error.message);
      res.status(500).json({ error: 'Falha ao enviar via Gateway' });
    }
  });

  // Save WhatsApp Gateway Config
  app.post('/api/whatsapp/config', async (req, res) => {
    const { instanceName, serverUrl, apiKey, companyId } = req.body;
    const targetCompanyId = companyId || 'default';

    try {
      await prisma.company.upsert({
        where: { id: targetCompanyId },
        update: { name: `Empresa ${targetCompanyId}` },
        create: { id: targetCompanyId, name: `Empresa ${targetCompanyId}` }
      });

      await prisma.whatsappConfig.upsert({
        where: { companyId: targetCompanyId },
        update: { instanceName, serverUrl, apiKey },
        create: { instanceName, serverUrl, apiKey, companyId: targetCompanyId }
      });
    } catch (e) {
      const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      if (!db.whatsappConfigs) db.whatsappConfigs = {};
      db.whatsappConfigs[targetCompanyId] = { instanceName, serverUrl, apiKey };
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    }
    res.json({ success: true });
  });

  // Get WhatsApp Config (Multitenant)
  app.get('/api/whatsapp/config', async (req, res) => {
    const companyId = req.query.companyId as string || 'default';
    try {
      const config = await prisma.whatsappConfig.findUnique({
        where: { companyId }
      });
      if (config) return res.json(config);
    } catch (e) {}

    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    res.json(db.whatsappConfigs?.[companyId] || {});
  });

  // Basic Auth Mock (for demo purposes)
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // In a real app, verify against DB
    res.json({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@techmanager.com',
        role: 'ADMIN-USER',
        companyId: 'comp-1'
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
