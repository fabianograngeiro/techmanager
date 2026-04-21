# Arquitetura e Módulos

## Stack
- Frontend: React 19 + Vite + Tailwind
- Backend: Express (`server.ts`)
- ORM: Prisma
- Banco: PostgreSQL
- Integração: WhatsApp Gateway (ex.: Evolution API)

## Estrutura principal
- `server.ts`: API e middleware de frontend no dev
- `src/App.tsx`: tela principal e módulos de negócio
- `src/components/WhatsAppView.tsx`: central de WhatsApp
- `src/components/PrintDesigner.tsx`: designer de impressão
- `prisma/schema.prisma`: modelos do banco

## Módulos do sistema
- Dashboard
- Ordens de Serviço
- Kanban
- Clientes
- Fornecedores
- Estoque / RMA
- PDV / Vendas
- Financeiro
- Equipe / Usuários
- Tarefas / Calendário
- WhatsApp
- Personalização de impressão

## Persistência atual
- Parte relevante ainda usa estado local/localStorage no frontend.
- Backend usa Prisma para recursos de WhatsApp e entidades modeladas.
- Fallback local para `db.json` quando DB não está disponível.

## Autenticação atual
- Fluxo de login local validando usuários persistidos no estado da aplicação.
- Evolução recomendada: autenticação com hash de senha + JWT/sessão.
