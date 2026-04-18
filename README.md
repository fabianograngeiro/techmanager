# TechManager

Sistema SaaS para gestao de assistencia tecnica com foco em operacao diaria.

O projeto centraliza os principais fluxos de uma assistencia:

- Ordens de servico (OS)
- Atendimento de clientes
- Estoque e RMA
- PDV e vendas
- Financeiro
- Equipe e permissoes
- Calendario e tarefas
- WhatsApp com webhook e envio de mensagens
- Personalizacao de impressao (etiqueta, cupom e A4)

## Visao Geral

O TechManager foi construido como uma aplicacao unica com frontend React e backend Express no mesmo repositorio.

- Frontend: React + Vite + Tailwind + componentes UI
- Backend: Express + Prisma
- Banco: PostgreSQL (com fallback local para demonstracao)
- Integracao: Gateway WhatsApp (ex: Evolution API)

## Principais Modulos

- Dashboard operacional
- Dashboard tecnico
- Lista de OS + detalhes da OS
- Quadro Kanban
- Clientes
- Fornecedores
- Estoque e RMA
- PDV / Vendas
- Financeiro
- Tarefas
- Calendario
- WhatsApp
- Configuracoes
- Personalizar impressao

## Estrutura do Projeto

```text
.
|- server.ts                 # Servidor Express (API + Vite middleware)
|- prisma/
|  |- schema.prisma          # Modelos do banco
|- src/
|  |- App.tsx                # Aplicacao principal e views
|  |- components/
|  |  |- WhatsAppView.tsx    # Inbox e envio de mensagens
|  |  |- PrintDesigner.tsx   # Editor visual de templates
|  |- types.ts               # Tipos de dominio
|  |- constants.ts           # Constantes de status e mocks
|  |- index.css              # Tokens visuais e estilos globais
|- components/ui/            # Componentes de UI reutilizaveis
|- DEPLOYMENT.md             # Guia de deploy em VPS
|- VPS-DEPLOY-DOCKER.yml     # Exemplo de stack Docker
```

## Requisitos

- Node.js 20+
- npm 10+

Opcional para ambiente completo:

- PostgreSQL
- Redis
- Gateway WhatsApp

## Instalacao

```bash
npm install
```

## Variaveis de Ambiente

Use `.env.example` como base para criar seu `.env`.

Variaveis comuns:

- `GEMINI_API_KEY` (opcional, para recursos de IA)
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_ACCESS_TOKEN` (quando aplicavel)
- `VITE_WHATSAPP_PHONE_NUMBER_ID` (quando aplicavel)
- `DATABASE_URL` (recomendado para persistencia com Prisma)

Observacao:

- Sem `DATABASE_URL` valida, algumas rotas usam fallback local em `db.json` para demo.

## Como Rodar

### Desenvolvimento

```bash
npm run dev
```

Esse comando sobe o servidor em modo desenvolvimento e injeta o frontend via middleware do Vite.

Servidor padrao: `http://localhost:3000`

### Build de Producao

```bash
npm run build
```

### Executar Build

```bash
npm run start
```

## Scripts Disponiveis

- `npm run dev` inicia backend + frontend em dev
- `npm run build` gera build do frontend
- `npm run start` executa build em modo producao
- `npm run lint` validacao TypeScript (sem emit)
- `npm run clean` remove pasta de build

## Banco de Dados (Prisma)

Com `DATABASE_URL` configurada:

```bash
npx prisma migrate dev --name init
```

Modelos principais:

- Company
- ServiceOrder
- Customer
- Product
- WhatsappConfig
- WhatsappChat
- WhatsappMessage

## Deploy

Para deploy em VPS e configuracao WhatsApp, veja:

- `DEPLOYMENT.md`
- `VPS-DEPLOY-DOCKER.yml`

## Estado Atual

O projeto esta funcional para operacao e demonstracao, com boa cobertura de modulos de negocio.

Pontos importantes de evolucao para ambiente enterprise:

- Consolidar persistencia de todos os modulos no banco
- Fortalecer autenticacao/autorizacao
- Quebrar `src/App.tsx` em modulos menores
- Cobertura de testes automatizados

## Licenca

Definir licenca do projeto (exemplo: MIT, proprietaria, etc.).
