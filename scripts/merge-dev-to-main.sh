#!/usr/bin/env bash
set -Eeuo pipefail

echo "[INFO] Preparando release: dev -> main"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[ERRO] Seu working tree tem alterações não commitadas."
  echo "[ERRO] Faça commit/stash antes de rodar este script."
  exit 1
fi

current_branch="$(git branch --show-current)"

git fetch origin
git checkout main
git pull --ff-only origin main

echo
read -r -p "Confirmar merge de origin/dev para main? (s/N): " confirm
confirm="${confirm,,}"
if [[ "${confirm}" != "s" && "${confirm}" != "sim" && "${confirm}" != "y" && "${confirm}" != "yes" ]]; then
  echo "[INFO] Operação cancelada."
  git checkout "${current_branch}"
  exit 0
fi

git merge --no-ff origin/dev -m "chore: release dev to main"
git push origin main

echo "[INFO] Merge concluído e enviado para origin/main."

if [[ "${current_branch}" != "main" ]]; then
  git checkout "${current_branch}"
fi
