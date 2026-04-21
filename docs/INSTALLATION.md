# Instalação e Setup

## 1. Pré-requisitos
- Node.js 20+
- npm 10+
- PostgreSQL (opcional, recomendado para persistência real)

## 2. Clone e dependências
```bash
git clone https://github.com/fabianograngeiro/techmanager.git
cd techmanager
npm install
```

## 3. Variáveis de ambiente
Crie `.env` baseado em `.env.example`:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/techmanager_db?schema=public"
WHATSAPP_VERIFY_TOKEN="tech-manager-verify"
WHATSAPP_ACCESS_TOKEN=""
VITE_WHATSAPP_PHONE_NUMBER_ID=""
GEMINI_API_KEY=""
APP_URL="http://localhost:3000"
```

Notas:
- Se `DATABASE_URL` não estiver válida, partes da API usam fallback local (`db.json`).
- Em produção, usar PostgreSQL ativo.

## 4. Banco de dados
Com PostgreSQL configurado:

```bash
npx prisma migrate dev --name init
```

Alternativas:
```bash
npx prisma migrate deploy
npx prisma db push
```

## 5. Execução local
```bash
npm run dev
```

A aplicação sobe em:
- `http://localhost:3000`

No modo dev:
- Express sobe em `server.ts`
- Vite é servido via middleware no mesmo processo
