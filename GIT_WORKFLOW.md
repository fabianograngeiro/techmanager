# Fluxo Git: `dev` e `main`

## Objetivo
- `dev`: código para desenvolvimento e testes.
- `main`: código estável para produção (VPS).

## Fluxo diário
1. Atualize `dev`:
```bash
git checkout dev
git pull origin dev
```
2. Crie sua branch de trabalho a partir de `dev`:
```bash
git checkout -b feat/minha-feature
```
3. Commit/push da feature:
```bash
git push -u origin feat/minha-feature
```
4. Abra PR para `dev`.
5. Após aprovação, faça merge em `dev`.

## Release para produção (`main`)
Quando o que está em `dev` estiver aprovado:
```bash
git fetch origin
git checkout main
git pull origin main
git merge --no-ff origin/dev -m "chore: release dev to main"
git push origin main
```

Depois, na VPS:
```bash
cd ~/techmanager
git checkout main
git pull origin main
```

## Recomendado no GitHub
- Proteger `main`:
  - exigir PR para merge;
  - bloquear push direto;
  - exigir pelo menos 1 aprovação.
- Opcional: proteger `dev` com PR obrigatório.
