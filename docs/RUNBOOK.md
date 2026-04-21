# Checklist de Funcionamento

## Saúde da aplicação
1. API responde:
```bash
curl -sS http://127.0.0.1:3000/api/health
```
2. Login abre dashboard.

## Fluxos críticos
1. Criar OS.
2. Abrir ações da OS (3 pontinhos) e validar:
   - Editar OS
   - PDF / Impressão A4
   - Etiqueta / Cupom
   - Compartilhar link
   - Excluir OS
3. Movimentação no Kanban.
4. Cadastro e consulta de clientes.
5. Estoque e venda com atualização de dados.
6. Financeiro com lançamentos.
7. WhatsApp:
   - salvar config
   - conectar/generar QR
   - receber/enviar mensagens

## Persistência
1. Confirmar gravação no PostgreSQL (quando configurado).
2. Confirmar fallback local quando sem DB.

## Produção
1. Validar acesso público (IP/domínio configurado).
2. Validar portas liberadas (80/443 ou 3000 conforme modo).
3. Validar logs sem erro crítico (Docker/PM2).
