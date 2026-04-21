# Operação e Deploy

## Ambientes
- `dev`: desenvolvimento/testes
- `main`: produção (VPS)

Fluxo recomendado: `dev -> aprovação -> merge -> main`.

## Deploy na VPS (produção)
No servidor:
```bash
cd ~/techmanager
git checkout main
git pull origin main
```

## Instalador Linux (interativo)
Arquivo: `linux_installer.sh`

Suporta:
- Runtime: `PM2` ou `Docker`
- Publicação: por `IP` ou `domínio`
- Proxy: com `Nginx` ou sem `Nginx` (acesso direto na porta 3000)
- Banco: local gerenciado pelo instalador ou externo (`DATABASE_URL`)

Execução:
```bash
./linux_installer.sh
```

## Desinstalador Linux (interativo)
Arquivo: `linux_uninstaller.sh`

Suporta:
- Remoção por modo de instalação (`PM2`/`Docker`)
- Remoção opcional de:
  - diretório da aplicação
  - configuração Nginx
  - certificado SSL
  - volume de banco Docker
  - banco local PostgreSQL (quando aplicável)

Execução:
```bash
./linux_uninstaller.sh
```

## Atualização em produção
1. Atualize `main`.
2. Reaplique runtime (quando necessário):
   - Docker/PM2 via `./linux_installer.sh`
3. Valide saúde:
```bash
curl -sS http://127.0.0.1:3000/api/health
```

## Comandos úteis
Docker:
```bash
sudo docker ps
sudo docker logs -f techmanager-app
```

PM2:
```bash
pm2 status
pm2 logs techmanager
```
