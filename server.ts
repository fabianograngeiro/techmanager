import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // JSON persistence fallback
  const DB_PATH = path.join(__dirname, 'db.json');
  const SUPPORT_CONTEXTS_PATH = path.join(__dirname, 'support-contexts.tmp.json');
  const buildDefaultDb = () => ({
    companies: [],
    users: [],
    customers: [],
    suppliers: [],
    orders: [],
    products: [],
    services: [],
    sales: [],
    finance: [],
    tasks: [],
    team: [],
    rma: [],
    equipmentTypes: [],
    printTemplates: [],
    companySettings: null,
    aiProviderConfigs: {},
    whatsappConfigs: {},
  });

  const readDb = () => {
    const defaults = buildDefaultDb();

    try {
      if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2));
        return defaults;
      }

      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      if (!raw.trim()) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2));
        return defaults;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2));
        return defaults;
      }

      return {
        ...defaults,
        ...parsed,
      };
    } catch (error) {
      console.warn('db.json inválido, restaurando estrutura padrão.', error);
      fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2));
      return defaults;
    }
  };

  const writeDb = (data: Record<string, unknown>) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  };
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(buildDefaultDb(), null, 2));
  }

  if (!fs.existsSync(SUPPORT_CONTEXTS_PATH)) {
    fs.writeFileSync(SUPPORT_CONTEXTS_PATH, JSON.stringify({ threads: {} }, null, 2));
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/app-state', (_req, res) => {
    try {
      res.json(readDb());
    } catch (error) {
      console.error('Erro ao carregar estado do app:', error);
      res.status(500).json({ error: 'Falha ao carregar dados do aplicativo.' });
    }
  });

  app.post('/api/app-state', (req, res) => {
    try {
      const current = readDb();
      const payload = req.body && typeof req.body === 'object' ? req.body : {};
      const next = {
        ...current,
        ...payload,
      };
      writeDb(next);
      res.json({ success: true, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Erro ao salvar estado do app:', error);
      res.status(500).json({ success: false, error: 'Falha ao salvar dados do aplicativo.' });
    }
  });

  const listInstalledPrinters = (): string[] => {
    const parseLines = (output: string) =>
      output
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const run = (cmd: string): string => {
      try {
        return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
      } catch {
        return '';
      }
    };

    if (process.platform === 'win32') {
      const psOutput = run('powershell -NoProfile -Command "Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name"');
      const psPrinters = parseLines(psOutput);
      if (psPrinters.length > 0) return Array.from(new Set(psPrinters)).sort((a, b) => a.localeCompare(b));

      const wmicOutput = run('wmic printer get name');
      const wmicPrinters = parseLines(wmicOutput).filter((line) => line.toLowerCase() !== 'name');
      return Array.from(new Set(wmicPrinters)).sort((a, b) => a.localeCompare(b));
    }

    const lpstatP = run('lpstat -p');
    const printersFromP = parseLines(lpstatP)
      .filter((line) => line.startsWith('printer '))
      .map((line) => line.split(/\s+/)[1])
      .filter(Boolean);

    if (printersFromP.length > 0) {
      return Array.from(new Set(printersFromP)).sort((a, b) => a.localeCompare(b));
    }

    const lpstatA = run('lpstat -a');
    const printersFromA = parseLines(lpstatA)
      .map((line) => line.split(/\s+/)[0])
      .filter(Boolean);

    return Array.from(new Set(printersFromA)).sort((a, b) => a.localeCompare(b));
  };

  app.get('/api/system/printers', (_req, res) => {
    try {
      const printers = listInstalledPrinters();
      res.json({ printers });
    } catch (error) {
      console.error('Erro ao listar impressoras:', error);
      res.status(500).json({ printers: [], error: 'Falha ao listar impressoras do sistema.' });
    }
  });

  app.get('/api/system/backup', (_req, res) => {
    try {
      const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      const supportContexts = JSON.parse(fs.readFileSync(SUPPORT_CONTEXTS_PATH, 'utf-8'));
      return res.json({
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        db,
        supportContexts,
      });
    } catch (error) {
      console.error('Erro ao gerar backup do sistema:', error);
      return res.status(500).json({ error: 'Falha ao gerar backup do sistema.' });
    }
  });

  app.post('/api/system/restore', (req, res) => {
    const payload = req.body || {};
    const db = payload?.db;
    const supportContexts = payload?.supportContexts;

    if (!db || typeof db !== 'object') {
      return res.status(400).json({ error: 'Backup invalido: bloco db ausente.' });
    }

    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      fs.writeFileSync(
        SUPPORT_CONTEXTS_PATH,
        JSON.stringify(supportContexts && typeof supportContexts === 'object' ? supportContexts : { threads: {} }, null, 2)
      );
      return res.json({ success: true, restoredAt: new Date().toISOString() });
    } catch (error) {
      console.error('Erro ao restaurar backup do sistema:', error);
      return res.status(500).json({ error: 'Falha ao restaurar backup do sistema.' });
    }
  });

  app.post('/api/system/factory-reset', (_req, res) => {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(buildDefaultDb(), null, 2));
      fs.writeFileSync(SUPPORT_CONTEXTS_PATH, JSON.stringify({ threads: {} }, null, 2));
      return res.json({ success: true, resetAt: new Date().toISOString() });
    } catch (error) {
      console.error('Erro ao resetar sistema para padrao de fabrica:', error);
      return res.status(500).json({ error: 'Falha ao resetar sistema para padrao de fabrica.' });
    }
  });

  app.get('/api/ai/provider-config', (req, res) => {
    const scope = (req.query.scope as string) || 'global';
    try {
      const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      res.json(db.aiProviderConfigs?.[scope] || {});
    } catch (error) {
      console.error('Erro ao carregar config de IA:', error);
      res.status(500).json({ error: 'Falha ao carregar configuração de IA.' });
    }
  });

  app.post('/api/ai/provider-config', (req, res) => {
    const {
      scope = 'global',
      openaiApiKey = '',
      groqApiKey = '',
      geminiApiKey = '',
      claudeApiKey = '',
      providerCatalogs = [],
      agentPrompts = [],
      companyAgentPlatforms = [],
      companyDefaultProvider = '',
      companyDefaultModel = '',
      companyModelSource = 'provider-default',
      updatedAt = new Date().toISOString(),
    } = req.body || {};

    try {
      const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      if (!db.aiProviderConfigs) db.aiProviderConfigs = {};
      db.aiProviderConfigs[scope] = {
        openaiApiKey: String(openaiApiKey || '').trim(),
        groqApiKey: String(groqApiKey || '').trim(),
        geminiApiKey: String(geminiApiKey || '').trim(),
        claudeApiKey: String(claudeApiKey || '').trim(),
        providerCatalogs: Array.isArray(providerCatalogs) ? providerCatalogs : [],
        agentPrompts: Array.isArray(agentPrompts) ? agentPrompts : [],
        companyAgentPlatforms: Array.isArray(companyAgentPlatforms) ? companyAgentPlatforms : [],
        companyDefaultProvider: String(companyDefaultProvider || '').trim(),
        companyDefaultModel: String(companyDefaultModel || '').trim(),
        companyModelSource: String(companyModelSource || 'provider-default').trim(),
        updatedAt,
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      res.json({ success: true, scope, updatedAt });
    } catch (error) {
      console.error('Erro ao salvar config de IA:', error);
      res.status(500).json({ success: false, error: 'Falha ao salvar configuração de IA.' });
    }
  });

  type AIProvider = 'openai' | 'groq' | 'gemini' | 'claude';

  const resolveProviderApiKey = (provider: AIProvider, config: any): string => {
    if (provider === 'openai') return String(config?.openaiApiKey || '').trim();
    if (provider === 'groq') return String(config?.groqApiKey || '').trim();
    if (provider === 'gemini') return String(config?.geminiApiKey || '').trim();
    return String(config?.claudeApiKey || '').trim();
  };

  const resolveFirstConfiguredProvider = (config: any): AIProvider | null => {
    if (String(config?.openaiApiKey || '').trim()) return 'openai';
    if (String(config?.groqApiKey || '').trim()) return 'groq';
    if (String(config?.geminiApiKey || '').trim()) return 'gemini';
    if (String(config?.claudeApiKey || '').trim()) return 'claude';
    return null;
  };

  const resolveConfiguredProviders = (config: any): AIProvider[] => {
    const providers: AIProvider[] = [];
    if (String(config?.openaiApiKey || '').trim()) providers.push('openai');
    if (String(config?.groqApiKey || '').trim()) providers.push('groq');
    if (String(config?.geminiApiKey || '').trim()) providers.push('gemini');
    if (String(config?.claudeApiKey || '').trim()) providers.push('claude');
    return providers;
  };

  type WebSearchItem = {
    title: string;
    url: string;
    snippet: string;
  };

  type SupportContextMessage = {
    role: 'technician' | 'agent';
    text: string;
    createdAt: string;
  };

  type SupportContextThread = {
    sessionId: string;
    osId?: string;
    expiresAt: string;
    updatedAt: string;
    messages: SupportContextMessage[];
  };

  const decodeHtml = (value: string): string =>
    String(value || '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<[^>]*>/g, '')
      .trim();

  const normalizeDuckDuckGoLink = (rawHref: string): string => {
    const href = String(rawHref || '').trim();
    if (!href) return '';
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('/l/?')) {
      const params = new URLSearchParams(href.slice(4));
      const target = params.get('uddg');
      if (target) return decodeURIComponent(target);
    }
    return href;
  };

  const AUTHORITATIVE_HOST_PATTERNS = [
    'dell.com',
    'support.dell.com',
    'notebookcheck.net',
    'intel.com',
    'amd.com',
    'nvidia.com',
    'wikipedia.org',
    'manualslib.com',
    'ifixit.com',
    'techpowerup.com',
    'tomshardware.com',
    'anandtech.com',
    'pcmag.com',
  ];

  const DISFAVORED_HOST_PATTERNS = [
    'zhihu.com',
    'pinterest.',
    'tiktok.com',
    'instagram.com',
    'facebook.com',
    'x.com',
    'twitter.com',
  ];

  const getHostFromUrl = (rawUrl: string): string => {
    try {
      return new URL(String(rawUrl || '').trim()).hostname.toLowerCase();
    } catch {
      return '';
    }
  };

  const rankWebResults = (items: WebSearchItem[], query: string, limit: number): WebSearchItem[] => {
    const queryTokens = String(query || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2);

    const seen = new Set<string>();
    const uniqueItems = items.filter((item) => {
      const normalizedUrl = String(item.url || '').trim();
      if (!normalizedUrl || seen.has(normalizedUrl)) return false;
      seen.add(normalizedUrl);
      return true;
    });

    const scored = uniqueItems.map((item) => {
      const host = getHostFromUrl(item.url);
      const title = String(item.title || '').toLowerCase();
      const snippet = String(item.snippet || '').toLowerCase();
      const haystack = `${title} ${snippet}`;

      let score = 0;
      if (AUTHORITATIVE_HOST_PATTERNS.some((pattern) => host.includes(pattern))) score += 60;
      if (DISFAVORED_HOST_PATTERNS.some((pattern) => host.includes(pattern))) score -= 40;

      const tokenHits = queryTokens.filter((token) => haystack.includes(token)).length;
      score += tokenHits * 4;

      if (/(spec|especifica|ficha|manual|datasheet|support|suporte|technical|tecnico)/.test(haystack)) {
        score += 8;
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const preferred = scored.filter((entry) => entry.score >= 20).map((entry) => entry.item);
    const selected = (preferred.length > 0 ? preferred : scored.map((entry) => entry.item)).slice(0, limit);
    return selected;
  };

  const buildAuthoritativeFallbackLinks = (query: string): WebSearchItem[] => {
    const q = String(query || '').trim();
    const encoded = encodeURIComponent(q);
    const normalized = q.toLowerCase();

    const items: WebSearchItem[] = [];

    if (/\bdell\b/.test(normalized)) {
      items.push(
        {
          title: 'Dell Support - Busca oficial do fabricante',
          url: `https://www.dell.com/support/search/pt-br#q=${encoded}`,
          snippet: 'Busca oficial da Dell para especificacoes, manuais, drivers e artigos tecnicos.',
        },
        {
          title: 'Dell Support Home',
          url: 'https://www.dell.com/support/home/pt-br',
          snippet: 'Portal oficial de suporte da Dell com diagnostico, documentacao tecnica e manuais.',
        }
      );
    }

    if (/\b(lenovo|thinkpad|ideapad)\b/.test(normalized)) {
      items.push({
        title: 'Lenovo Support - Busca oficial',
        url: `https://support.lenovo.com/br/pt/search?query=${encoded}`,
        snippet: 'Busca oficial Lenovo para manuais, FRU, BIOS e especificacoes.',
      });
    }

    if (/\b(hp|omen|pavilion|probook|elitebook)\b/.test(normalized)) {
      items.push({
        title: 'HP Support - Busca oficial',
        url: `https://support.hp.com/br-pt/search?q=${encoded}`,
        snippet: 'Busca oficial HP para guias de manutencao, drivers e especificacoes.',
      });
    }

    if (/\b(acer|aspire|nitro|predator)\b/.test(normalized)) {
      items.push({
        title: 'Acer Support - Busca oficial',
        url: `https://www.acer.com/br-pt/support?search=${encoded}`,
        snippet: 'Portal oficial Acer para documentacao tecnica, drivers e suporte.',
      });
    }

    items.push(
      {
        title: 'Notebookcheck - Busca tecnica',
        url: `https://www.notebookcheck.net/Search.8222.0.html?cx=partner-pub-2405307702513060%3A9965952934&cof=FORID%3A10&ie=UTF-8&q=${encoded}`,
        snippet: 'Referencia tecnica de notebooks com testes de hardware e termica.',
      },
      {
        title: 'Intel ARK - Busca de processador',
        url: `https://www.intel.com/content/www/us/en/search.html?ws=text#q=${encoded}`,
        snippet: 'Especificacoes oficiais de processadores Intel.',
      },
      {
        title: 'AMD Product Specifications - Busca',
        url: `https://www.amd.com/en/search/site-search.html#q=${encoded}`,
        snippet: 'Especificacoes oficiais de CPUs/GPUs AMD.',
      }
    );

    return items;
  };

  const searchBingRss = async (query: string, limit = 8): Promise<WebSearchItem[]> => {
    const bingResponse = await axios.get('https://www.bing.com/search', {
      params: { q: String(query || '').trim(), format: 'rss' },
      timeout: 20000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    const bingXml = String(bingResponse.data || '');
    const itemMatches = Array.from(
      bingXml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/gim)
    );

    return itemMatches
      .slice(0, limit)
      .map((match) => ({
        title: decodeHtml(match[1] || ''),
        url: decodeHtml(match[2] || ''),
        snippet: decodeHtml(match[3] || ''),
      }))
      .filter((item) => item.title && item.url);
  };

  const searchWeb = async (query: string, limit = 5): Promise<WebSearchItem[]> => {
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) return [];

    try {
      const response = await axios.get('https://html.duckduckgo.com/html/', {
        params: { q: cleanQuery },
        timeout: 20000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });

      const html = String(response.data || '');
      const matches = Array.from(
        html.matchAll(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gim)
      );

      const results: WebSearchItem[] = [];
      for (const match of matches) {
        const href = normalizeDuckDuckGoLink(match[1] || '');
        const title = decodeHtml(match[2] || '');
        if (!href || !title) continue;

        const blockStart = Number(match.index || 0);
        const blockTail = html.slice(blockStart, blockStart + 1400);
        const snippetMatch =
          blockTail.match(/class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\//i) ||
          blockTail.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/i);

        const snippet = decodeHtml(snippetMatch?.[1] || '');
        results.push({ title, url: href, snippet });
        if (results.length >= limit) break;
      }

      const baseBingResults = await searchBingRss(cleanQuery, Math.max(8, limit * 2));

      const targetedQueries = [
        `site:dell.com ${cleanQuery}`,
        `site:support.dell.com ${cleanQuery}`,
        `site:notebookcheck.net ${cleanQuery}`,
        `site:intel.com ${cleanQuery}`,
      ];

      const targetedResults = await Promise.all(
        targetedQueries.map(async (q) => {
          try {
            return await searchBingRss(q, 4);
          } catch {
            return [] as WebSearchItem[];
          }
        })
      );

      const merged = [results, baseBingResults, ...targetedResults].flat();
      const ranked = rankWebResults(merged, cleanQuery, limit);

      const hasAuthoritative = ranked.some((item) => {
        const host = getHostFromUrl(item.url);
        return AUTHORITATIVE_HOST_PATTERNS.some((pattern) => host.includes(pattern));
      });

      if (hasAuthoritative) return ranked;

      const fallbackLinks = buildAuthoritativeFallbackLinks(cleanQuery);
      const fallbackRanked = rankWebResults([...fallbackLinks, ...ranked], cleanQuery, limit);
      return fallbackRanked;
    } catch (error) {
      console.error('Erro na busca web (DuckDuckGo):', error);
      return [];
    }
  };

  const getSupportThreadsFromDb = (db: any): Record<string, SupportContextThread> => {
    if (!db.threads || typeof db.threads !== 'object') {
      db.threads = {};
    }
    return db.threads as Record<string, SupportContextThread>;
  };

  const loadSupportContexts = (): Record<string, SupportContextThread> => {
    try {
      const fileData = JSON.parse(fs.readFileSync(SUPPORT_CONTEXTS_PATH, 'utf-8'));
      return getSupportThreadsFromDb(fileData);
    } catch {
      return {};
    }
  };

  const saveSupportContexts = (threads: Record<string, SupportContextThread>) => {
    fs.writeFileSync(SUPPORT_CONTEXTS_PATH, JSON.stringify({ threads }, null, 2));
  };

  const pruneSupportThreads = (threads: Record<string, SupportContextThread>, now = new Date()) => {
    Object.keys(threads).forEach((sessionId) => {
      const thread = threads[sessionId];
      const expiresAt = new Date(thread?.expiresAt || 0);
      if (!thread || !Array.isArray(thread.messages) || expiresAt.getTime() <= now.getTime()) {
        delete threads[sessionId];
      }
    });
  };

  const formatShortHistory = (messages: SupportContextMessage[]): string => {
    if (!messages.length) return 'Sem histórico recente.';
    return messages
      .slice(-6)
      .map((message) => {
        const roleLabel = message.role === 'agent' ? 'Agente' : 'Tecnico';
        const shortText = String(message.text || '').replace(/\s+/g, ' ').trim().slice(0, 280);
        return `- ${roleLabel}: ${shortText}`;
      })
      .join('\n');
  };

  app.post('/api/ai/web-search', async (req, res) => {
    const query = String(req.body?.query || '').trim();
    const limit = Math.min(10, Math.max(1, Number(req.body?.limit || 5)));

    if (!query) {
      return res.status(400).json({ error: 'Query inválida para busca web.' });
    }

    try {
      const results = await searchWeb(query, limit);
      return res.json({ query, results });
    } catch (error: any) {
      const detail = error?.message || 'Erro desconhecido';
      console.error('Erro no endpoint de busca web:', detail);
      return res.status(500).json({ error: 'Falha na busca web.', detail: String(detail) });
    }
  });

  const tokenizeForSearch = (text: string): string[] =>
    String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length > 2);

  const findInventoryMatches = (params: { query?: string; equipment?: string; limit?: number }) => {
    const { query = '', equipment = '', limit = 8 } = params;
    const safeLimit = Math.max(1, Math.min(20, Number(limit || 8)));

    let products: any[] = [];
    try {
      const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      products = Array.isArray(db.products) ? db.products : [];
    } catch {
      products = [];
    }

    const queryTokens = new Set(tokenizeForSearch(query));
    const equipmentTokens = new Set(tokenizeForSearch(equipment));

    const ranked = products
      .map((product) => {
        const text = `${String(product?.name || '')} ${String(product?.sku || '')}`;
        const productTokens = tokenizeForSearch(text);
        const queryHits = productTokens.filter((token) => queryTokens.has(token)).length;
        const equipmentHits = productTokens.filter((token) => equipmentTokens.has(token)).length;
        const score = queryHits * 3 + equipmentHits * 2;
        return {
          id: product?.id,
          name: String(product?.name || '').trim(),
          sku: String(product?.sku || '').trim(),
          price: Number(product?.price || 0),
          stock: Number(product?.stock || 0),
          score,
        };
      })
      .filter((item) => item.name && item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, safeLimit);

    return ranked;
  };

  type JsonRpcRequest = {
    jsonrpc?: string;
    id?: string | number | null;
    method?: string;
    params?: any;
  };

  const jsonRpcError = (id: any, code: number, message: string, data?: any) => ({
    jsonrpc: '2.0',
    id: id ?? null,
    error: { code, message, data },
  });

  const MCP_TOOLS = [
    {
      name: 'web_search',
      description: 'Pesquisa informacoes atuais na web e retorna links tecnicos priorizados.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Termo de busca.' },
          limit: { type: 'number', description: 'Quantidade maxima de resultados (1-10).' },
        },
        required: ['query'],
      },
    },
    {
      name: 'inventory_search',
      description: 'Busca pecas/produtos no estoque local com score de compatibilidade por texto.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Descricao da peca ou problema.' },
          equipment: { type: 'string', description: 'Equipamento/modelo para compatibilidade.' },
          limit: { type: 'number', description: 'Quantidade maxima de resultados (1-20).' },
        },
      },
    },
  ];

  app.get('/mcp/health', (_req, res) => {
    res.json({ status: 'ok', name: 'techmanager-mcp', transport: 'json-rpc-http' });
  });

  app.post('/mcp', async (req, res) => {
    const rpc = (req.body || {}) as JsonRpcRequest;
    const method = String(rpc.method || '').trim();
    const id = rpc.id ?? null;

    if (rpc.jsonrpc && rpc.jsonrpc !== '2.0') {
      return res.status(400).json(jsonRpcError(id, -32600, 'Invalid Request: jsonrpc must be 2.0'));
    }

    try {
      if (method === 'initialize') {
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: { name: 'techmanager-mcp', version: '1.0.0' },
            capabilities: { tools: {} },
          },
        });
      }

      if (method === 'tools/list') {
        return res.json({ jsonrpc: '2.0', id, result: { tools: MCP_TOOLS } });
      }

      if (method === 'tools/call') {
        const name = String(rpc.params?.name || '').trim();
        const args = rpc.params?.arguments || {};

        if (name === 'web_search') {
          const query = String(args?.query || '').trim();
          const limit = Number(args?.limit || 5);
          if (!query) {
            return res.status(400).json(jsonRpcError(id, -32602, 'query e obrigatoria para web_search'));
          }

          const results = await searchWeb(query, Math.max(1, Math.min(10, limit)));
          return res.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ query, count: results.length, results }, null, 2),
                },
              ],
              structuredContent: { query, results },
            },
          });
        }

        if (name === 'inventory_search') {
          const query = String(args?.query || '').trim();
          const equipment = String(args?.equipment || '').trim();
          const limit = Number(args?.limit || 8);
          const items = findInventoryMatches({ query, equipment, limit });
          return res.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ query, equipment, count: items.length, items }, null, 2),
                },
              ],
              structuredContent: { query, equipment, items },
            },
          });
        }

        return res.status(400).json(jsonRpcError(id, -32601, `Tool nao encontrada: ${name}`));
      }

      if (method === 'ping') {
        return res.json({ jsonrpc: '2.0', id, result: { ok: true } });
      }

      return res.status(400).json(jsonRpcError(id, -32601, `Method not found: ${method}`));
    } catch (error: any) {
      return res.status(500).json(jsonRpcError(id, -32000, 'Internal MCP server error', String(error?.message || error)));
    }
  });

  const callProvider = async (params: {
    provider: AIProvider;
    apiKey: string;
    prompt: string;
    model?: string;
    temperature?: number;
  }): Promise<{ text: string; modelUsed: string }> => {
    const { provider, apiKey, prompt, model, temperature = 0.25 } = params;

    if (provider === 'openai') {
      const modelUsed = model || 'gpt-4o-mini';
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: modelUsed,
          temperature,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      );
      const text = response.data?.choices?.[0]?.message?.content || '';
      return { text, modelUsed };
    }

    if (provider === 'groq') {
      const modelUsed = model || 'llama-3.3-70b-versatile';
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: modelUsed,
          temperature,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      );
      const text = response.data?.choices?.[0]?.message?.content || '';
      return { text, modelUsed };
    }

    if (provider === 'gemini') {
      const modelUsed = model || 'gemini-1.5-pro';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelUsed)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await axios.post(
        endpoint,
        {
          generationConfig: { temperature },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 45000,
        }
      );
      const text =
        response.data?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text || '').join('\n') || '';
      return { text, modelUsed };
    }

    const modelUsed = model || 'claude-3-5-sonnet-latest';
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: modelUsed,
        max_tokens: 1400,
        temperature,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: 45000,
      }
    );

    const text =
      response.data?.content?.map((part: any) => (typeof part?.text === 'string' ? part.text : '')).join('\n') || '';
    return { text, modelUsed };
  };

  const listProviderModels = async (provider: AIProvider, apiKey: string): Promise<string[]> => {
    if (!apiKey) return [];

    if (provider === 'openai') {
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 25000,
      });
      return (response.data?.data || [])
        .map((item: any) => String(item?.id || ''))
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b));
    }

    if (provider === 'groq') {
      const response = await axios.get('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 25000,
      });
      return (response.data?.data || [])
        .map((item: any) => String(item?.id || ''))
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b));
    }

    if (provider === 'gemini') {
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
        { timeout: 25000 }
      );
      return (response.data?.models || [])
        .map((item: any) => String(item?.name || '').replace(/^models\//, ''))
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b));
    }

    const response = await axios.get('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      timeout: 25000,
    });
    return (response.data?.data || [])
      .map((item: any) => String(item?.id || item?.name || ''))
      .filter(Boolean)
      .sort((a: string, b: string) => a.localeCompare(b));
  };

  app.get('/api/ai/provider-models', async (req, res) => {
    const provider = String(req.query.provider || '').trim() as AIProvider;
    const scope = String(req.query.scope || 'global').trim();

    if (!['openai', 'groq', 'gemini', 'claude'].includes(provider)) {
      return res.status(400).json({ error: 'Provider invalido.' });
    }

    try {
      const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      const scopedConfig = db.aiProviderConfigs?.[scope] || {};
      const globalConfig = db.aiProviderConfigs?.global || {};
      const providerConfig = {
        ...globalConfig,
        ...scopedConfig,
        openaiApiKey: String(scopedConfig?.openaiApiKey || '').trim() || String(globalConfig?.openaiApiKey || '').trim(),
        groqApiKey: String(scopedConfig?.groqApiKey || '').trim() || String(globalConfig?.groqApiKey || '').trim(),
        geminiApiKey: String(scopedConfig?.geminiApiKey || '').trim() || String(globalConfig?.geminiApiKey || '').trim(),
        claudeApiKey: String(scopedConfig?.claudeApiKey || '').trim() || String(globalConfig?.claudeApiKey || '').trim(),
      };
      const apiKey = resolveProviderApiKey(provider, providerConfig);
      if (!apiKey) {
        return res.status(400).json({ error: `Chave API nao configurada para ${provider} no escopo ${scope}.` });
      }

      const models = await listProviderModels(provider, apiKey);
      return res.json({ provider, scope, models });
    } catch (error: any) {
      const detail = error?.response?.data || error?.message || 'Erro desconhecido';
      console.error('Erro ao listar modelos de IA:', detail);
      return res.status(500).json({ error: 'Falha ao listar modelos do provider.', detail });
    }
  });

  app.post('/api/ai/technical-support/query', async (req, res) => {
    const {
      scope = 'global',
      provider = 'openai',
      model = '',
      prompt = '',
      userMessage = '',
      sessionId = '',
      osId = '',
      webContext = [],
      temperature = 0.25,
    } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt inválido.' });
    }

    if (!['openai', 'groq', 'gemini', 'claude'].includes(provider)) {
      return res.status(400).json({ error: 'Provider inválido.' });
    }

    try {
      const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      const scopedConfig = db.aiProviderConfigs?.[scope] || {};
      const globalConfig = db.aiProviderConfigs?.global || {};
      const providerConfig = {
        ...globalConfig,
        ...scopedConfig,
        openaiApiKey: String(scopedConfig?.openaiApiKey || '').trim() || String(globalConfig?.openaiApiKey || '').trim(),
        groqApiKey: String(scopedConfig?.groqApiKey || '').trim() || String(globalConfig?.groqApiKey || '').trim(),
        geminiApiKey: String(scopedConfig?.geminiApiKey || '').trim() || String(globalConfig?.geminiApiKey || '').trim(),
        claudeApiKey: String(scopedConfig?.claudeApiKey || '').trim() || String(globalConfig?.claudeApiKey || '').trim(),
      };
      const threads = loadSupportContexts();
      pruneSupportThreads(threads);

      const cleanSessionId = String(sessionId || '').trim();
      const nowIso = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString();

      const existingThread = cleanSessionId ? threads[cleanSessionId] : null;
      const recentHistory = existingThread?.messages || [];

      const passedWebContext = Array.isArray(webContext)
        ? webContext
            .map((item: any) => ({
              title: String(item?.title || '').trim(),
              url: String(item?.url || '').trim(),
              snippet: String(item?.snippet || '').trim(),
            }))
            .filter((item: WebSearchItem) => item.title && item.url)
        : [];

      const webContextBlock = passedWebContext.length
        ? passedWebContext
            .slice(0, 6)
            .map((item: WebSearchItem, idx: number) => `${idx + 1}) ${item.title}\nURL: ${item.url}\nResumo: ${item.snippet}`)
            .join('\n\n')
        : 'Sem referências web adicionais nesta solicitação.';

      const promptWithRuntimeContext = `${String(prompt || '').trim()}\n\nContexto temporário (arquivo 15 dias):\n${formatShortHistory(
        recentHistory
      )}\n\nReferências web atuais (use somente se fizer sentido técnico e cite URL quando recomendar peça):\n${webContextBlock}\n\nDiretriz de resposta:\n- Responda apenas a solicitação atual do técnico.\n- Não reimprima histórico completo.`;

      let runtimeProvider = provider as AIProvider;
      let apiKey = resolveProviderApiKey(runtimeProvider, providerConfig);

      if (!apiKey) {
        const fallbackProvider = resolveFirstConfiguredProvider(providerConfig);
        if (fallbackProvider) {
          runtimeProvider = fallbackProvider;
          apiKey = resolveProviderApiKey(runtimeProvider, providerConfig);
        }
      }

      if (!apiKey) {
        return res.status(400).json({
          error: `Nenhuma chave API configurada no escopo "${scope}" (ou global fallback).`,
        });
      }

      let text = '';
      let modelUsed = '';
      try {
        const primary = await callProvider({
          provider: runtimeProvider,
          apiKey,
          prompt: promptWithRuntimeContext,
          model,
          temperature,
        });
        text = primary.text;
        modelUsed = primary.modelUsed;
      } catch (providerError: any) {
        const configuredProviders = resolveConfiguredProviders(providerConfig).filter((item) => item !== runtimeProvider);
        let recovered = false;
        for (const candidate of configuredProviders) {
          const candidateKey = resolveProviderApiKey(candidate, providerConfig);
          if (!candidateKey) continue;
          try {
            const retry = await callProvider({
              provider: candidate,
              apiKey: candidateKey,
              prompt: promptWithRuntimeContext,
              model: '',
              temperature,
            });
            runtimeProvider = candidate;
            apiKey = candidateKey;
            text = retry.text;
            modelUsed = retry.modelUsed;
            recovered = true;
            break;
          } catch {
            // tenta o próximo provider configurado
          }
        }
        if (!recovered) throw providerError;
      }

      if (!text || !text.trim()) {
        return res.status(502).json({ error: 'Provider retornou resposta vazia.' });
      }

      if (cleanSessionId) {
        const nextThread: SupportContextThread = {
          sessionId: cleanSessionId,
          osId: String(osId || existingThread?.osId || '').trim() || undefined,
          updatedAt: nowIso,
          expiresAt,
          messages: [
            ...(existingThread?.messages || []),
            {
              role: 'technician',
              text: String(userMessage || '').trim() || 'Solicitação sem texto explícito.',
              createdAt: nowIso,
            },
            {
              role: 'agent',
              text: String(text || '').trim(),
              createdAt: nowIso,
            },
          ].slice(-24),
        };
        threads[cleanSessionId] = nextThread;
      }

      saveSupportContexts(threads);

      return res.json({
        provider: runtimeProvider,
        model: modelUsed,
        text,
      });
    } catch (error: any) {
      const detail = error?.response?.data || error?.message || 'Erro desconhecido';
      console.error('Erro no suporte técnico IA:', detail);
      return res.status(500).json({ error: 'Falha ao consultar provider de IA.', detail: String(typeof detail === 'object' ? JSON.stringify(detail) : detail) });
    }
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
      return res.status(502).json({
        error: 'Falha ao obter QR Code no gateway.',
        detail: error?.response?.data || error?.message || 'Erro desconhecido',
      });
    }
  });

  // Webhook Verification (GET)
  app.get('/api/whatsapp/webhook', (req, res) => {
    // Many gateways also use standard webhooks
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN_GLOBAL) {
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

  // Basic local auth endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};

    try {
      const db = readDb();
      const users = Array.isArray(db.users) ? db.users : [];
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const candidate = users.find(
        (user: any) =>
          String(user?.email || '').trim().toLowerCase() === normalizedEmail &&
          String(user?.password || '') === String(password || '')
      );

      if (!candidate) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const { password: _password, ...safeUser } = candidate;
      return res.json({
        token: `local-${safeUser.id}`,
        user: safeUser,
      });
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      return res.status(500).json({ error: 'Falha ao autenticar usuário.' });
    }
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
