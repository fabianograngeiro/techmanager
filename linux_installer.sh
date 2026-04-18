#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="TechManager"
SERVICE_NAME="techmanager"
DEFAULT_INSTALL_DIR="/opt/techmanager"
DEFAULT_PORT="3000"
DEFAULT_DB_NAME="techmanager_db"
DEFAULT_DB_USER="techmanager"

if [[ ${EUID} -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DEPLOY_MODE=""
ACCESS_MODE=""
SETUP_DB="no"
DB_MODE="none"
DB_NAME="${DEFAULT_DB_NAME}"
DB_USER="${DEFAULT_DB_USER}"
DB_PASS=""
DB_HOST="127.0.0.1"
DB_PORT="5432"
EXTERNAL_DB_URL=""
DATABASE_URL=""

INSTALL_DIR="${DEFAULT_INSTALL_DIR}"
APP_USER="${SUDO_USER:-${USER}}"
PUBLIC_HOST=""
DOMAIN_NAME=""
SSL_EMAIL=""
ENABLE_SSL="no"
APP_URL=""
VERIFY_TOKEN=""

on_error() {
  local line="${1:-unknown}"
  echo
  echo "[ERRO] Falha na instalacao na linha ${line}."
  echo "[ERRO] Corrija o problema acima e execute novamente."
}
trap 'on_error $LINENO' ERR

log() {
  echo "[INFO] $1"
}

warn() {
  echo "[WARN] $1"
}

fail() {
  echo "[ERRO] $1"
  exit 1
}

require_apt() {
  if ! command -v apt-get >/dev/null 2>&1; then
    fail "Este instalador suporta somente Debian/Ubuntu (apt-get)."
  fi
}

ask_with_default() {
  local prompt="$1"
  local default_value="$2"
  local answer
  read -r -p "${prompt} [${default_value}]: " answer
  if [[ -z "${answer}" ]]; then
    echo "${default_value}"
  else
    echo "${answer}"
  fi
}

ask_yes_no() {
  local prompt="$1"
  local default_choice="${2:-yes}"
  local default_label="s/N"
  if [[ "${default_choice}" == "no" ]]; then
    default_label="S/n"
  fi

  while true; do
    local answer
    read -r -p "${prompt} (${default_label}): " answer
    answer="${answer,,}"
    if [[ -z "${answer}" ]]; then
      answer="${default_choice}"
    fi
    case "${answer}" in
      s|sim|y|yes) echo "yes"; return ;;
      n|nao|não|no) echo "no"; return ;;
      *) warn "Resposta invalida. Digite s ou n." ;;
    esac
  done
}

ask_menu() {
  local title="$1"
  shift
  local options=("$@")

  while true; do
    echo
    echo "${title}"
    local i=1
    for option in "${options[@]}"; do
      echo "  ${i}) ${option}"
      ((i++))
    done
    local answer
    read -r -p "Escolha uma opcao: " answer
    if [[ "${answer}" =~ ^[0-9]+$ ]] && (( answer >= 1 && answer <= ${#options[@]} )); then
      echo "${options[$((answer - 1))]}"
      return
    fi
    warn "Opcao invalida."
  done
}

random_token() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 10
  else
    date +%s%N | sha256sum | cut -c1-20
  fi
}

random_password() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 20
  else
    date +%s%N | sha256sum | cut -c1-20
  fi
}

validate_linux_user() {
  id "${APP_USER}" >/dev/null 2>&1 || fail "Usuario Linux '${APP_USER}' nao existe."
}

validate_db_identifier() {
  local value="$1"
  local label="$2"
  if [[ ! "${value}" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
    fail "${label} invalido: use apenas letras, numeros e underscore."
  fi
}

validate_db_password() {
  local value="$1"
  if [[ "${value}" =~ [[:space:]] ]]; then
    fail "Senha do banco nao pode conter espacos."
  fi
  if [[ "${value}" == *"'"* ]]; then
    fail "Senha do banco nao pode conter aspas simples (')."
  fi
}

run_as_app_user() {
  local cmd="$1"
  if [[ "$(id -un)" == "${APP_USER}" ]]; then
    bash -lc "${cmd}"
  else
    ${SUDO} -H -u "${APP_USER}" bash -lc "${cmd}"
  fi
}

apt_install() {
  ${SUDO} apt-get install -y "$@"
}

install_common_requirements() {
  log "Instalando dependencias de sistema"
  ${SUDO} apt-get update -y
  apt_install ca-certificates curl gnupg lsb-release git rsync unzip nginx openssl
}

install_node_if_needed() {
  local need_install="false"
  if ! command -v node >/dev/null 2>&1; then
    need_install="true"
  else
    local major
    major="$(node -v | sed 's/^v//' | cut -d'.' -f1)"
    if [[ "${major}" -lt 20 ]]; then
      need_install="true"
    fi
  fi

  if [[ "${need_install}" == "true" ]]; then
    log "Instalando Node.js 20"
    curl -fsSL https://deb.nodesource.com/setup_20.x | ${SUDO} -E bash -
    apt_install nodejs build-essential
  else
    log "Node.js ja instalado: $(node -v)"
  fi
}

install_pm2_if_needed() {
  if command -v pm2 >/dev/null 2>&1; then
    log "PM2 ja instalado"
    return
  fi
  log "Instalando PM2"
  ${SUDO} npm install -g pm2
}

install_docker_if_needed() {
  if command -v docker >/dev/null 2>&1; then
    log "Docker ja instalado"
  else
    log "Instalando Docker Engine"
    curl -fsSL https://get.docker.com | ${SUDO} sh
  fi

  ${SUDO} systemctl enable --now docker
  ${SUDO} usermod -aG docker "${APP_USER}" || true

  if ! ${SUDO} docker compose version >/dev/null 2>&1; then
    fail "Docker Compose plugin nao disponivel. Verifique instalacao do Docker."
  fi
}

install_postgres_if_needed() {
  if command -v psql >/dev/null 2>&1; then
    log "PostgreSQL ja instalado"
  else
    log "Instalando PostgreSQL local"
    apt_install postgresql postgresql-contrib
  fi
  ${SUDO} systemctl enable --now postgresql
}

create_or_update_local_database() {
  validate_db_identifier "${DB_USER}" "Usuario do banco"
  validate_db_identifier "${DB_NAME}" "Nome do banco"
  validate_db_password "${DB_PASS}"

  log "Configurando usuario e banco local no PostgreSQL"
  ${SUDO} -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SQL

  if [[ "$(${SUDO} -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")" != "1" ]]; then
    ${SUDO} -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
  fi
  ${SUDO} -u postgres psql -d "${DB_NAME}" -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" >/dev/null
}

sync_app_files() {
  log "Copiando arquivos da aplicacao para ${INSTALL_DIR}"
  ${SUDO} mkdir -p "${INSTALL_DIR}"
  ${SUDO} rsync -a \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude 'db.json' \
    --exclude '.env' \
    "${SCRIPT_DIR}/" "${INSTALL_DIR}/"
  ${SUDO} chown -R "${APP_USER}:${APP_USER}" "${INSTALL_DIR}"
}

upsert_env() {
  local env_file="$1"
  local key="$2"
  local value="$3"
  local tmp_file
  tmp_file="$(mktemp)"

  if grep -q "^${key}=" "${env_file}" 2>/dev/null; then
    awk -v k="${key}" -v v="${value}" '
      $0 ~ ("^" k "=") { print k "=\"" v "\""; next }
      { print }
    ' "${env_file}" > "${tmp_file}"
  else
    cat "${env_file}" > "${tmp_file}"
    echo "${key}=\"${value}\"" >> "${tmp_file}"
  fi
  mv "${tmp_file}" "${env_file}"
}

remove_env_key() {
  local env_file="$1"
  local key="$2"
  local tmp_file
  tmp_file="$(mktemp)"
  if [[ -f "${env_file}" ]]; then
    grep -v "^${key}=" "${env_file}" > "${tmp_file}" || true
    mv "${tmp_file}" "${env_file}"
  fi
}

configure_env_file() {
  local env_file="${INSTALL_DIR}/.env"

  if [[ ! -f "${env_file}" ]]; then
    if [[ -f "${INSTALL_DIR}/.env.example" ]]; then
      cp "${INSTALL_DIR}/.env.example" "${env_file}"
    else
      touch "${env_file}"
    fi
  fi

  upsert_env "${env_file}" "APP_URL" "${APP_URL}"
  upsert_env "${env_file}" "WHATSAPP_VERIFY_TOKEN" "${VERIFY_TOKEN}"

  if [[ -n "${DATABASE_URL}" ]]; then
    upsert_env "${env_file}" "DATABASE_URL" "${DATABASE_URL}"
  else
    remove_env_key "${env_file}" "DATABASE_URL"
  fi

  ${SUDO} chown "${APP_USER}:${APP_USER}" "${env_file}"
}

run_prisma_migrations_if_possible() {
  if [[ -z "${DATABASE_URL}" ]]; then
    log "Banco nao configurado: pulando migrations Prisma."
    return
  fi

  if [[ "${DEPLOY_MODE}" == "docker" && "${DB_MODE}" == "local" ]]; then
    log "Migrations serao executadas apos subir os containers."
    return
  fi

  log "Executando migrations Prisma"
  run_as_app_user "cd '${INSTALL_DIR}' && npx prisma migrate deploy || npx prisma db push"
}

setup_pm2_runtime() {
  log "Instalando dependencias do app (modo PM2)"
  run_as_app_user "cd '${INSTALL_DIR}' && npm install"
  run_as_app_user "cd '${INSTALL_DIR}' && npx prisma generate || true"
  run_prisma_migrations_if_possible

  log "Subindo aplicacao com PM2"
  run_as_app_user "cd '${INSTALL_DIR}' && pm2 delete '${SERVICE_NAME}' >/dev/null 2>&1 || true"
  run_as_app_user "cd '${INSTALL_DIR}' && pm2 start npm --name '${SERVICE_NAME}' -- run dev"
  run_as_app_user "pm2 save"

  warn "Para iniciar automaticamente no boot, execute apos a instalacao:"
  warn "sudo -u ${APP_USER} pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}"
}

write_docker_runtime_files() {
  local dockerfile="${INSTALL_DIR}/Dockerfile.techmanager"
  local dockerignore="${INSTALL_DIR}/.dockerignore"
  local compose_file="${INSTALL_DIR}/docker-compose.techmanager.yml"

  cat > "${dockerfile}" <<'DOCKERFILE'
FROM node:20-bookworm-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate || true

EXPOSE 3000
CMD ["npm", "run", "dev"]
DOCKERFILE

  cat > "${dockerignore}" <<'DOCKERIGNORE'
node_modules
dist
.git
db.json
.env
DOCKERIGNORE

  if [[ "${DB_MODE}" == "local" ]]; then
    cat > "${compose_file}" <<EOF
services:
  postgres:
    image: postgres:15
    container_name: ${SERVICE_NAME}-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - ${SERVICE_NAME}_pgdata:/var/lib/postgresql/data

  app:
    build:
      context: .
      dockerfile: Dockerfile.techmanager
    container_name: ${SERVICE_NAME}-app
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "127.0.0.1:${DEFAULT_PORT}:${DEFAULT_PORT}"
    depends_on:
      - postgres

volumes:
  ${SERVICE_NAME}_pgdata:
EOF
  else
    cat > "${compose_file}" <<EOF
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.techmanager
    container_name: ${SERVICE_NAME}-app
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "127.0.0.1:${DEFAULT_PORT}:${DEFAULT_PORT}"
EOF
  fi
}

setup_docker_runtime() {
  log "Preparando runtime Docker"
  write_docker_runtime_files
  ${SUDO} docker compose -f "${INSTALL_DIR}/docker-compose.techmanager.yml" down >/dev/null 2>&1 || true
  ${SUDO} docker compose -f "${INSTALL_DIR}/docker-compose.techmanager.yml" up -d --build

  if [[ -n "${DATABASE_URL}" ]]; then
    log "Executando migrations Prisma dentro do container"
    ${SUDO} docker exec "${SERVICE_NAME}-app" npx prisma migrate deploy || \
      ${SUDO} docker exec "${SERVICE_NAME}-app" npx prisma db push || true
  fi
}

write_nginx_config() {
  local server_name="${PUBLIC_HOST}"
  local nginx_file="/etc/nginx/sites-available/${SERVICE_NAME}"
  if [[ "${ACCESS_MODE}" == "ip" ]]; then
    server_name="_ ${PUBLIC_HOST}"
  fi

  ${SUDO} tee "${nginx_file}" >/dev/null <<EOF
server {
  listen 80;
  server_name ${server_name};

  location / {
    proxy_pass http://127.0.0.1:${DEFAULT_PORT};
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

  ${SUDO} ln -sf "${nginx_file}" "/etc/nginx/sites-enabled/${SERVICE_NAME}"
  if [[ -f /etc/nginx/sites-enabled/default ]]; then
    ${SUDO} rm -f /etc/nginx/sites-enabled/default
  fi

  ${SUDO} nginx -t
  ${SUDO} systemctl restart nginx
}

setup_ssl_if_requested() {
  if [[ "${ACCESS_MODE}" != "domain" || "${ENABLE_SSL}" != "yes" ]]; then
    return
  fi

  log "Configurando HTTPS com Certbot"
  apt_install certbot python3-certbot-nginx
  ${SUDO} certbot --nginx \
    -d "${DOMAIN_NAME}" \
    --non-interactive \
    --agree-tos \
    -m "${SSL_EMAIL}" \
    --redirect
}

detect_public_ip() {
  local detected_ip=""
  detected_ip="$(curl -4fsSL https://api.ipify.org || true)"
  if [[ -z "${detected_ip}" ]]; then
    detected_ip="$(hostname -I | awk '{print $1}')"
  fi
  echo "${detected_ip:-127.0.0.1}"
}

collect_inputs() {
  echo
  echo "==== Instalador Linux - ${APP_NAME} ===="
  echo

  local selected_mode
  selected_mode="$(ask_menu "Escolha o modo de deploy" "PM2 (Node.js no host)" "Docker (containers)")"
  if [[ "${selected_mode}" == "PM2 (Node.js no host)" ]]; then
    DEPLOY_MODE="pm2"
  else
    DEPLOY_MODE="docker"
  fi

  local selected_access
  selected_access="$(ask_menu "Como o app sera publicado?" "IP do servidor" "Dominio dedicado")"
  if [[ "${selected_access}" == "IP do servidor" ]]; then
    ACCESS_MODE="ip"
  else
    ACCESS_MODE="domain"
  fi

  INSTALL_DIR="$(ask_with_default "Diretorio de instalacao do app" "${DEFAULT_INSTALL_DIR}")"
  APP_USER="$(ask_with_default "Usuario Linux dono do app" "${APP_USER}")"
  validate_linux_user

  local setup_db_answer
  setup_db_answer="$(ask_yes_no "Deseja configurar banco de dados?" "yes")"
  if [[ "${setup_db_answer}" == "yes" ]]; then
    SETUP_DB="yes"
    local selected_db_mode
    selected_db_mode="$(ask_menu "Tipo de banco" "Banco local gerenciado pelo instalador" "Banco externo (informar DATABASE_URL)")"
    if [[ "${selected_db_mode}" == "Banco local gerenciado pelo instalador" ]]; then
      DB_MODE="local"
      DB_NAME="$(ask_with_default "Nome do banco" "${DEFAULT_DB_NAME}")"
      DB_USER="$(ask_with_default "Usuario do banco" "${DEFAULT_DB_USER}")"
      DB_PORT="$(ask_with_default "Porta do banco" "5432")"
      DB_PASS="$(ask_with_default "Senha do banco" "$(random_password)")"
      validate_db_password "${DB_PASS}"
    else
      DB_MODE="external"
      read -r -p "Informe DATABASE_URL completa: " EXTERNAL_DB_URL
      [[ -z "${EXTERNAL_DB_URL}" ]] && fail "DATABASE_URL externa nao pode ficar vazia."
    fi
  fi

  if [[ "${ACCESS_MODE}" == "ip" ]]; then
    local detected_ip
    detected_ip="$(detect_public_ip)"
    PUBLIC_HOST="$(ask_with_default "IP publico do servidor" "${detected_ip}")"
    APP_URL="http://${PUBLIC_HOST}"
  else
    DOMAIN_NAME="$(ask_with_default "Dominio do app (ex: app.seudominio.com)" "")"
    [[ -z "${DOMAIN_NAME}" ]] && fail "Dominio nao pode ser vazio."
    PUBLIC_HOST="${DOMAIN_NAME}"
    local ssl_answer
    ssl_answer="$(ask_yes_no "Deseja configurar HTTPS com Certbot agora?" "yes")"
    if [[ "${ssl_answer}" == "yes" ]]; then
      ENABLE_SSL="yes"
      SSL_EMAIL="$(ask_with_default "Email para certificado SSL" "")"
      [[ -z "${SSL_EMAIL}" ]] && fail "Email obrigatorio para configuracao SSL automatica."
      APP_URL="https://${DOMAIN_NAME}"
    else
      APP_URL="http://${DOMAIN_NAME}"
    fi
  fi

  VERIFY_TOKEN="tech-manager-$(random_token)"
}

resolve_database_url() {
  DATABASE_URL=""
  if [[ "${SETUP_DB}" != "yes" ]]; then
    return
  fi

  if [[ "${DB_MODE}" == "external" ]]; then
    DATABASE_URL="${EXTERNAL_DB_URL}"
    return
  fi

  if [[ "${DEPLOY_MODE}" == "docker" ]]; then
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@postgres:5432/${DB_NAME}?schema=public"
  else
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
  fi
}

install_requirements_by_mode() {
  install_common_requirements
  if [[ "${DEPLOY_MODE}" == "pm2" ]]; then
    install_node_if_needed
    install_pm2_if_needed
  else
    install_docker_if_needed
  fi

  if [[ "${SETUP_DB}" == "yes" && "${DB_MODE}" == "local" && "${DEPLOY_MODE}" == "pm2" ]]; then
    install_postgres_if_needed
    create_or_update_local_database
  fi
}

setup_firewall_hint() {
  if command -v ufw >/dev/null 2>&1; then
    warn "Se estiver usando UFW, garanta que portas 80 e 443 estao liberadas."
    warn "Exemplo: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
  fi
}

print_summary() {
  echo
  echo "==== Instalacao concluida ===="
  echo "App: ${APP_NAME}"
  echo "Modo: ${DEPLOY_MODE}"
  echo "Acesso: ${APP_URL}"
  echo "Diretorio: ${INSTALL_DIR}"
  if [[ -n "${DATABASE_URL}" ]]; then
    echo "Banco: configurado (${DB_MODE})"
  else
    echo "Banco: nao configurado (fallback local via db.json em partes da API)"
  fi
  echo
  if [[ "${DEPLOY_MODE}" == "pm2" ]]; then
    echo "Comandos uteis:"
    echo "  sudo -u ${APP_USER} pm2 status"
    echo "  sudo -u ${APP_USER} pm2 logs ${SERVICE_NAME}"
  else
    echo "Comandos uteis:"
    echo "  sudo docker ps"
    echo "  sudo docker logs -f ${SERVICE_NAME}-app"
  fi
}

main() {
  require_apt
  collect_inputs
  resolve_database_url
  install_requirements_by_mode
  sync_app_files
  configure_env_file

  if [[ "${DEPLOY_MODE}" == "pm2" ]]; then
    setup_pm2_runtime
  else
    setup_docker_runtime
  fi

  write_nginx_config
  setup_ssl_if_requested
  setup_firewall_hint
  print_summary
}

main "$@"
