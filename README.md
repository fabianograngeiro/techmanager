# TechManager

Plataforma SaaS para gestao de assistencia tecnica.

Este guia mostra o passo a passo completo para configurar, executar e publicar o projeto.

## 1. O que o projeto entrega

Principais modulos:

- Dashboard operacional
- Ordens de servico (OS)
- Kanban
- Clientes
- Fornecedores
- Estoque e RMA
- PDV / Vendas
- Financeiro
- Equipe e permissoes
- Tarefas e calendario
- WhatsApp (conversas, envio e webhook)
- Personalizacao de impressao (Etiqueta, Cupom, A4)

Stack tecnica:

- Frontend: React 19 + Vite + Tailwind
- Backend: Express
- ORM: Prisma
- Banco: PostgreSQL
- Integracao: Gateway WhatsApp (exemplo: Evolution API)

## 2. Requisitos

Obrigatorio:

- Node.js 20 ou superior
- npm 10 ou superior

Para ambiente completo:

- PostgreSQL
- Redis (quando usar Evolution API)
- Gateway WhatsApp (Evolution API ou equivalente)

## 3. Clonar e instalar

1. Clone o repositorio.
2. Entre na pasta do projeto.
3. Instale as dependencias.

```bash
git clone https://github.com/fabianograngeiro/techmanager.git
cd techmanager
npm install
```

## 4. Configurar variaveis de ambiente

1. Crie o arquivo .env na raiz do projeto.
2. Copie os valores de exemplo.
3. Ajuste cada variavel para seu ambiente.

Exemplo base:

```env
# Banco de dados
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/techmanager_db?schema=public"

# WhatsApp / webhook
WHATSAPP_VERIFY_TOKEN="tech-manager-verify"
WHATSAPP_ACCESS_TOKEN=""
VITE_WHATSAPP_PHONE_NUMBER_ID=""

# Opcional IA
GEMINI_API_KEY=""

# Opcional para links internos
APP_URL="http://localhost:3000"
```

Observacoes:

- Se DATABASE_URL nao estiver valida, parte da API usa fallback local em db.json para demonstracao.
- Em producao, use sempre PostgreSQL ativo.

## 5. Subir banco e aplicar schema Prisma

Se voce ja tem PostgreSQL rodando, use sua URL no .env e rode as migracoes.

```bash
npx prisma migrate dev --name init
```

Opcional para verificar dados com interface Prisma Studio:

```bash
npx prisma studio
```

## 6. Executar o app em desenvolvimento

1. Inicie o servidor dev.
2. Abra no navegador.

```bash
npm run dev
```

URL padrao:

- http://localhost:3000

Como funciona no dev:

- O backend Express sobe em server.ts
- O frontend Vite e servido por middleware no mesmo processo

## 7. Primeiro acesso no sistema

Contas de teste disponiveis na tela de login:

- saas@admin.com
- admin@empresa.com
- joao@tecnico.com

Senha no fluxo demo: qualquer valor preenchido (login mock no frontend).

## 8. Configurar WhatsApp por empresa

1. Entre no modulo Configuracoes.
2. Abra a aba API WhatsApp.
3. Preencha:

- instanceName
- serverUrl
- apiKey

4. Salve as configuracoes.
5. Use a opcao de conectar para gerar QR code.
6. Configure webhook do provedor apontando para:

- GET/POST /api/whatsapp/webhook

Webhook de validacao usa WHATSAPP_VERIFY_TOKEN.

## 9. Build e execucao em producao

Gerar build do frontend:

```bash
npm run build
```

Executar aplicacao em producao:

```bash
npm run start
```

Scripts disponiveis:

- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run clean

## 10. Deploy com Docker (opcional)

Ha um compose de referencia em VPS-DEPLOY-DOCKER.yml com:

- PostgreSQL
- Redis
- Evolution API
- TechManager

Fluxo sugerido:

1. Ajustar senhas e chaves no arquivo de deploy.
2. Configurar dominio e HTTPS no proxy reverso (Nginx/Caddy).
3. Subir stack.
4. Aplicar migracoes Prisma no ambiente.

## 11. Checklist de validacao final

Antes de considerar ambiente pronto, valide:

1. API responde em /api/health
2. Login abre dashboard
3. Criacao de OS funcionando
4. Movimentacao no Kanban funcionando
5. Fluxo de estoque e venda atualizando dados
6. Envio e recebimento WhatsApp funcionando
7. Persistencia no PostgreSQL funcionando
8. Backup do banco configurado
9. HTTPS ativo no dominio

## 12. Estrutura principal do repositorio

```text
.
|- server.ts
|- prisma/
|  |- schema.prisma
|- src/
|  |- App.tsx
|  |- components/
|  |  |- WhatsAppView.tsx
|  |  |- PrintDesigner.tsx
|  |- constants.ts
|  |- types.ts
|  |- index.css
|- components/ui/
|- DEPLOYMENT.md
|- VPS-DEPLOY-DOCKER.yml
```

## 13. Proximos passos recomendados

- Migrar 100% dos dados de localStorage para banco
- Implementar autenticacao real com hash de senha e JWT/sessao
- Adicionar testes automatizados (unitarios e integracao)
- Quebrar App.tsx em modulos menores

## 14. Licenca

Definir licenca do projeto (MIT, proprietaria ou outra).
