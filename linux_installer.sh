#!/usr/bin/env bash
set -euo pipefail

APP_NAME="TechManager"
DEFAULT_REPO_URL="https://github.com/fabianograngeiro/techmanager.git"
DEFAULT_APP_DIR="/opt/techmanager"
DEFAULT_PORT="3000"

if [[ "${EUID}" -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

log() {
  echo "[INFO] $1"
}

warn() {
  echo "[WARN] $1"
}

fail() {
  echo "[ERROR] $1"
  exit 1
}

ask_default() {
  local prompt="$1"
  local default_value="$2"
  local value
  read -r -p "$prompt [$default_value]: " value
  if [[ -z "$value" ]]; then
    echo "$default_value"
  else
    echo "$value"
  fi
}

ask_choice() {
  local prompt="$1"
  shift
  local options=("$@")
  local answer

  while true; do
    echo "$prompt"
    local idx=1
    for option in "${options[@]}"; do
      echo "  $idx) $option"
      ((idx++))
    done

    read -r -p "Escolha uma opcao: " answer
    if [[ "$answer" =~ ^[0-9]+$ ]] && (( answer >= 1 && answer <= ${#options[@]} )); then
      echo "${options[$((answer - 1))]}"
      return
    fi

    warn "Opcao invalida. Tente novamente."
  done
}

ensure_apt() {
  if ! command -v apt-get >/dev/null 2>&1; then
    fail "Este instalador foi feito para distribuicoes Debian/Ubuntu (apt-get)."
  fi
}

ensure_common_packages() {
  log "Instalando pacotes basicos do sistema"
  $SUDO apt-get update -y
  $SUDO apt-get install -y ca-certificates curl git gnupg lsb-release nginx jq
}

ensure_node() {
  local need_install="false"

  if ! command -v node >/dev/null 2>&1; then
    need_install="true"
  else
    local current_major
    current_major="$(node -v | sed 's/v//' | cut -d'.' -f1)"
    if [[ "$current_major" -lt 20 ]]; then
      need_install="true"
    fi
  fi

  if [[ "$need_install" == "true" ]]; then
    log "Instalando Node.js 20"
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
    $SUDO apt-get install -y nodejs
  else
    log "Node.js ja instalado: $(node -v)"
  fi
}

ensure_docker() {
  if command -v docker >/dev/null 2>&1; then
    log "Docker ja instalado"
    return
  fi

  log "Instalando Docker Engine e plugin Compose"
  $SUDO install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  $SUDO chmod a+r /etc/apt/keyrings/docker.gpg

  local arch
  arch="$(dpkg --print-architecture)"
  local codename
  codename="$(. /etc/os-release && echo "$VERSION_CODENAME")"

  echo "deb [arch=$arch signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $codename stable" | $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null

  $SUDO apt-get update -y
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  $SUDO systemctl enable --now docker

  if [[ "$EUID" -ne 0 ]]; then
    $SUDO usermod -aG docker "$USER" || true
    warn "Usuario adicionado ao grupo docker. Se necessario, faca logout/login apos a instalacao."
  fi
}

ensure_pm2() {
  if command -v pm2 >/dev/null 2>&1; then
    log "PM2 ja instalado"
    return
  fi

  log "Instalando PM2 global"
  $SUDO npm install -g pm2
}

prepare_repo() {
  local repo_url="$1"
  local app_dir="$2"

  if [[ -d "$app_dir/.git" ]]; then
    log "Repositorio existente encontrado em $app_dir. Atualizando"
    git -C "$app_dir" fetch --all --prune
    git -C "$app_dir" reset --hard origin/main
  else
    log "Clonando repositorio em $app_dir"
    $SUDO mkdir -p "$(dirname "$app_dir")"
    if [[ -d "$app_dir" ]]; then
      $SUDO rm -rf "$app_dir"
    fi
    git clone "$repo_url" "$app_dir"
  fi
}

write_or_replace_env() {
  local file="$1"
  local key="$2"
  local value="$3"

  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=\"${value}\"|" "$file"
  else
    echo "${key}=\"${value}\"" >> "$file"
  fi
}

configure_env() {
  local app_dir="$1"
  local app_url="$2"
  local db_url="$3"
  local verify_token="$4"

  local env_file="$app_dir/.env"
  if [[ ! -f "$env_file" ]]; then
    if [[ -f "$app_dir/.env.example" ]]; then
      cp "$app_dir/.env.example" "$env_file"
    else
      touch "$env_file"
    fi
  fi

  write_or_replace_env "$env_file" "APP_URL" "$app_url"
  write_or_replace_env "$env_file" "DATABASE_URL" "$db_url"
  write_or_replace_env "$env_file" "WHATSAPP_VERIFY_TOKEN" "$verify_token"

  log "Arquivo .env configurado em $env_file"
}

configure_nginx() {
  local server_name="$1"
  local upstream_port="$2"

  local nginx_file="/etc/nginx/sites-available/techmanager"

  $SUDO tee "$nginx_file" >/dev/null <<EOF
server {
  listen 80;
  server_name $server_name;

  location / {
    proxy_pass http://127.0.0.1:$upstream_port;
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

  $SUDO ln -sf "$nginx_file" /etc/nginx/sites-enabled/techmanager
  if [[ -f /etc/nginx/sites-enabled/default ]]; then
    $SUDO rm -f /etc/nginx/sites-enabled/default
  fi

  $SUDO nginx -t
  $SUDO systemctl restart nginx
}

configure_ssl_certbot() {
  local domain="$1"
  local email="$2"

  log "Instalando certbot para TLS"
  $SUDO apt-get install -y certbot python3-certbot-nginx

  if [[ -n "$email" ]]; then
    $SUDO certbot --nginx -d "$domain" --non-interactive --agree-tos -m "$email" --redirect || warn "Falha ao obter certificado automaticamente."
  else
    warn "Email nao informado. Pulando certbot automatico."
  fi
}

docker_mode_setup() {
  local app_dir="$1"
  local use_existing_db="$2"
  local existing_db_url="$3"
  local db_name="$4"
  local db_user="$5"
  local db_pass="$6"

  if [[ ! -f "$app_dir/Dockerfile" ]]; then
    cat > "$app_dir/Dockerfile" <<'EOF'
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "NODE_ENV=production npx tsx server.ts"]
EOF
  fi

  local compose_file="$app_dir/docker-compose.installer.yml"
  if [[ "$use_existing_db" == "yes" ]]; then
    cat > "$compose_file" <<EOF
services:
  techmanager:
    build: .
    container_name: techmanager-app
    restart: always
    environment:
      - PORT=3000
      - NODE_ENV=production
      - DATABASE_URL=$existing_db_url
    ports:
      - "3000:3000"
EOF
  else
    cat > "$compose_file" <<EOF
services:
  postgres:
    image: postgres:15
    container_name: techmanager-postgres
    restart: always
    environment:
      POSTGRES_DB: $db_name
      POSTGRES_USER: $db_user
      POSTGRES_PASSWORD: $db_pass
    ports:
      - "5432:5432"
    volumes:
      - techmanager_pgdata:/var/lib/postgresql/data

  techmanager:
    build: .
    container_name: techmanager-app
    restart: always
    environment:
      - PORT=3000
      - NODE_ENV=production
      - DATABASE_URL=postgresql://$db_user:$db_pass@postgres:5432/$db_name?schema=public
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  techmanager_pgdata:
EOF
  fi

  log "Subindo stack Docker"
  (cd "$app_dir" && $SUDO docker compose -f docker-compose.installer.yml up -d --build)
}

pm2_mode_setup() {
  local app_dir="$1"
  local use_existing_db="$2"
  local db_name="$3"
  local db_user="$4"
  local db_pass="$5"
  local db_port="$6"

  if [[ "$use_existing_db" != "yes" ]]; then
    ensure_docker
    log "Subindo PostgreSQL em container para modo PM2"
    $SUDO docker rm -f techmanager-postgres >/dev/null 2>&1 || true
    $SUDO docker volume create techmanager_pgdata >/dev/null 2>&1 || true
    $SUDO docker run -d \
      --name techmanager-postgres \
      --restart always \
      -e POSTGRES_DB="$db_name" \
      -e POSTGRES_USER="$db_user" \
      -e POSTGRES_PASSWORD="$db_pass" \
      -p "$db_port:5432" \
      -v techmanager_pgdata:/var/lib/postgresql/data \
      postgres:15 >/dev/null
  fi

  log "Instalando dependencias do app"
  (cd "$app_dir" && npm install)

  log "Gerando build frontend"
  (cd "$app_dir" && npm run build)

  ensure_pm2

  log "Publicando app com PM2"
  pm2 delete techmanager >/dev/null 2>&1 || true
  (cd "$app_dir" && NODE_ENV=production PORT=3000 pm2 start "npx tsx server.ts" --name techmanager --time --update-env)
  pm2 save

  warn "Para habilitar auto start do PM2 no boot, execute manualmente:"
  warn "pm2 startup systemd -u $USER --hp $HOME"
}

main() {
  ensure_apt

  log "Iniciando instalacao interativa do $APP_NAME"

  local mode
  mode="$(ask_choice "Escolha o modo de publicacao" "Docker" "PM2")"

  local access_mode
  access_mode="$(ask_choice "Como deseja acessar o sistema" "Local IP" "Dominio VPS")"

  local db_mode
  db_mode="$(ask_choice "Como configurar o banco de dados" "PostgreSQL Docker" "PostgreSQL Externo")"

  local repo_url
  repo_url="$(ask_default "URL do repositorio" "$DEFAULT_REPO_URL")"

  local app_dir
  app_dir="$(ask_default "Diretorio de instalacao" "$DEFAULT_APP_DIR")"

  local db_name
  db_name="$(ask_default "Nome do banco" "techmanager_db")"

  local db_user
  db_user="$(ask_default "Usuario do banco" "techuser")"

  local db_pass
  db_pass="$(ask_default "Senha do banco" "$(openssl rand -hex 12)")"

  local db_port
  db_port="$(ask_default "Porta do banco (quando local/docker host)" "5432")"

  local existing_db_url=""
  local use_existing_db="no"
  if [[ "$db_mode" == "PostgreSQL Externo" ]]; then
    use_existing_db="yes"
    read -r -p "Informe DATABASE_URL completa: " existing_db_url
    if [[ -z "$existing_db_url" ]]; then
      fail "DATABASE_URL externa obrigatoria para esse modo."
    fi
  fi

  local domain=""
  local ssl_email=""
  if [[ "$access_mode" == "Dominio VPS" ]]; then
    read -r -p "Dominio (exemplo: app.seudominio.com): " domain
    if [[ -z "$domain" ]]; then
      fail "Dominio obrigatorio para esse modo."
    fi
    read -r -p "Email para SSL (certbot): " ssl_email
  fi

  ensure_common_packages
  ensure_node

  if [[ "$mode" == "Docker" ]]; then
    ensure_docker
  fi

  prepare_repo "$repo_url" "$app_dir"

  local verify_token
  verify_token="tech-manager-$(openssl rand -hex 6)"

  local app_url
  if [[ "$access_mode" == "Dominio VPS" ]]; then
    app_url="https://$domain"
  else
    local host_ip
    host_ip="$(hostname -I | awk '{print $1}')"
    if [[ -z "$host_ip" ]]; then
      host_ip="127.0.0.1"
    fi
    app_url="http://$host_ip"
  fi

  local db_url
  if [[ "$use_existing_db" == "yes" ]]; then
    db_url="$existing_db_url"
  elif [[ "$mode" == "Docker" ]]; then
    db_url="postgresql://$db_user:$db_pass@postgres:5432/$db_name?schema=public"
  else
    db_url="postgresql://$db_user:$db_pass@127.0.0.1:$db_port/$db_name?schema=public"
  fi

  configure_env "$app_dir" "$app_url" "$db_url" "$verify_token"

  if [[ "$mode" == "Docker" ]]; then
    docker_mode_setup "$app_dir" "$use_existing_db" "$existing_db_url" "$db_name" "$db_user" "$db_pass"
  else
    pm2_mode_setup "$app_dir" "$use_existing_db" "$db_name" "$db_user" "$db_pass" "$db_port"
  fi

  if [[ "$access_mode" == "Dominio VPS" ]]; then
    configure_nginx "$domain" "$DEFAULT_PORT"
    configure_ssl_certbot "$domain" "$ssl_email"
  else
    configure_nginx "_" "$DEFAULT_PORT"
  fi

  log "Instalacao finalizada com sucesso"
  log "URL esperada: $app_url"
  if [[ "$mode" == "PM2" ]]; then
    log "Status PM2: pm2 status"
  else
    log "Status Docker: docker ps"
  fi
}

main "$@"
