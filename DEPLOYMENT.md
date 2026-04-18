# Guia de Implantação SaaS TechManager (WhatsApp + PostgreSQL)

Este guia descreve como configurar o seu SaaS para produção em uma VPS.

## 1. Configuração do Banco de Dados (PostgreSQL)

O sistema utiliza o **Prisma ORM** para gerenciar o banco de dados. Para conectar o seu PostgreSQL:

1.  Crie um arquivo `.env` na raiz do projeto (ou adicione às variáveis de ambiente da sua VPS).
2.  Adicione a sua URL de conexão:
    ```env
    DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public"
    ```
3.  Execute as migrações para criar as tabelas:
    ```bash
    npx prisma migrate dev --name init
    ```

## 2. Configuração do WhatsApp Business (Meta)

### No Painel de Desenvolvedor da Meta:
1.  **Crie um App**: Tipo "Business".
2.  **Adicione o Produto WhatsApp**: Vá em "Configurações" do WhatsApp.
3.  **Webhook**:
    *   **Callback URL**: `https://seu-dominio.com/api/whatsapp/webhook`
    *   **Verify Token**: `tech-manager-verify` (ou o que você definir no seu servidor).
    *   **Campos**: Assine o campo `messages`.

### Gerenciando Clientes (Empresas):
*   Cada empresa (cliente) do seu SaaS deve ir na tela de **Configurações > WhatsApp** do seu sistema.
*   Lá, elas devem inserir o seu próprio **Phone Number ID** e **Access Token** gerados no painel da Meta para o número delas.

## 3. Implantação na VPS (Linux/Ubuntu)

### Pré-requisitos:
```bash
sudo apt update
sudo apt install nodejs npm postgresql nginx
```

### Passo a Passo:
1.  **Clone o projeto** e instale as dependências: `npm install`.
2.  **Configure o Nginx** como Proxy Reverso (porta 80 -> 3000).
3.  **Certificado SSL**: Use `certbot` para ativar o HTTPS (obrigatório para WhatsApp).
4.  **Gerenciador de Processos (PM2)**:
    ```bash
    npm install -g pm2
    pm2 start server.ts --interpreter tsx --name techmanager-backend
    ```

## 4. Variáveis de Ambiente Necessárias (.env)
*   `DATABASE_URL`: Conexão PostgreSQL.
*   `WHATSAPP_VERIFY_TOKEN`: Mesmo token inserido no painel da Meta (Ex: `tech-manager-verify`).
*   `GEMINI_API_KEY`: Para recursos de IA.
