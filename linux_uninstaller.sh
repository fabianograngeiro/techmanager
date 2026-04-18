#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="TechManager"
SERVICE_NAME="techmanager"
DEFAULT_INSTALL_DIR="/opt/techmanager"
DEFAULT_DB_VOLUME="techmanager_pgdata"

if [[ ${EUID} -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

MODE=""
INSTALL_DIR="${DEFAULT_INSTALL_DIR}"
APP_USER="${SUDO_USER:-${USER}}"
REMOVE_APP_DIR="yes"
REMOVE_NGINX="yes"
REMOVE_CERTS="no"
DOMAIN_NAME=""
REMOVE_DOCKER_VOLUME="no"
REMOVE_LOCAL_DB="no"
DB_NAME=""
DB_USER=""
DB_HOST=""
DB_PORT=""

on_error() {
  local line="${1:-unknown}"
  echo
  echo "[ERRO] Falha na desinstalacao na linha ${line}."
}
trap 'on_error $LINENO' ERR

log() {
  echo "[INFO] $1"
}

warn() {
  echo "[WARN] $1" >&2
}

fail() {
  echo "[ERRO] $1" >&2
  exit 1
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
  local default_choice="${2:-no}"
  local default_label="s/N"
  if [[ "${default_choice}" == "yes" ]]; then
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
    echo >&2
    echo "${title}" >&2
    local i=1
    for option in "${options[@]}"; do
      echo "  ${i}) ${option}" >&2
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

run_as_app_user() {
  local cmd="$1"
  if [[ "$(id -un)" == "${APP_USER}" ]]; then
    bash -lc "${cmd}"
  else
    ${SUDO} -H -u "${APP_USER}" bash -lc "${cmd}"
  fi
}

validate_db_identifier() {
  local value="$1"
  local label="$2"
  if [[ ! "${value}" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
    fail "${label} invalido: ${value}"
  fi
}

extract_database_info_from_env() {
  local env_file="${INSTALL_DIR}/.env"
  if [[ ! -f "${env_file}" ]]; then
    return
  fi

  local db_url
  db_url="$(grep '^DATABASE_URL=' "${env_file}" | tail -1 | cut -d'=' -f2- | tr -d '"'"'" || true)"
  if [[ -z "${db_url}" ]]; then
    return
  fi

  if [[ "${db_url}" =~ ^postgres(ql)?://([^:]+):([^@]+)@([^:/]+):([0-9]+)/([^?]+) ]]; then
    DB_USER="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[4]}"
    DB_PORT="${BASH_REMATCH[5]}"
    DB_NAME="${BASH_REMATCH[6]}"
  fi
}

stop_pm2_app() {
  log "Removendo processo PM2 (${SERVICE_NAME})"
  run_as_app_user "pm2 delete '${SERVICE_NAME}' >/dev/null 2>&1 || true"
  run_as_app_user "pm2 save >/dev/null 2>&1 || true"
}

stop_docker_app() {
  local compose_file="${INSTALL_DIR}/docker-compose.techmanager.yml"
  log "Parando containers Docker do app"
  if [[ -f "${compose_file}" ]]; then
    ${SUDO} docker compose -f "${compose_file}" down --remove-orphans || true
  fi

  ${SUDO} docker rm -f "${SERVICE_NAME}-app" >/dev/null 2>&1 || true
  ${SUDO} docker rm -f "${SERVICE_NAME}-postgres" >/dev/null 2>&1 || true

  if [[ "${REMOVE_DOCKER_VOLUME}" == "yes" ]]; then
    log "Removendo volume Docker do banco (${DEFAULT_DB_VOLUME})"
    ${SUDO} docker volume rm "${DEFAULT_DB_VOLUME}" >/dev/null 2>&1 || true
  fi
}

remove_nginx_config() {
  if [[ "${REMOVE_NGINX}" != "yes" ]]; then
    return
  fi

  log "Removendo configuracao Nginx do app"
  ${SUDO} rm -f "/etc/nginx/sites-enabled/${SERVICE_NAME}"
  ${SUDO} rm -f "/etc/nginx/sites-available/${SERVICE_NAME}"
  ${SUDO} nginx -t
  ${SUDO} systemctl restart nginx
}

remove_ssl_cert() {
  if [[ "${REMOVE_CERTS}" != "yes" || -z "${DOMAIN_NAME}" ]]; then
    return
  fi

  if ! command -v certbot >/dev/null 2>&1; then
    warn "Certbot nao encontrado. Pulando remocao de certificado."
    return
  fi

  log "Removendo certificado SSL de ${DOMAIN_NAME}"
  ${SUDO} certbot delete --cert-name "${DOMAIN_NAME}" --non-interactive || true
}

drop_local_database_if_requested() {
  if [[ "${REMOVE_LOCAL_DB}" != "yes" ]]; then
    return
  fi

  if [[ -z "${DB_NAME}" || -z "${DB_USER}" ]]; then
    DB_NAME="$(ask_with_default "Nome do banco para remover" "techmanager_db")"
    DB_USER="$(ask_with_default "Usuario do banco para remover" "techmanager")"
  fi

  validate_db_identifier "${DB_NAME}" "Nome do banco"
  validate_db_identifier "${DB_USER}" "Usuario do banco"

  if ! command -v psql >/dev/null 2>&1; then
    warn "PostgreSQL client nao encontrado. Pulando remocao de banco."
    return
  fi

  log "Removendo banco local (${DB_NAME}) e usuario (${DB_USER})"
  ${SUDO} -u postgres psql -v ON_ERROR_STOP=1 <<SQL
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS ${DB_NAME};
DROP ROLE IF EXISTS ${DB_USER};
SQL
}

remove_app_dir_if_requested() {
  if [[ "${REMOVE_APP_DIR}" != "yes" ]]; then
    return
  fi

  if [[ -d "${INSTALL_DIR}" ]]; then
    log "Removendo diretorio da aplicacao: ${INSTALL_DIR}"
    ${SUDO} rm -rf "${INSTALL_DIR}"
  fi
}

collect_inputs() {
  echo
  echo "==== Desinstalador Linux - ${APP_NAME} ===="
  echo

  local selected_mode
  selected_mode="$(ask_menu "Como o app foi instalado?" "PM2 (Node.js no host)" "Docker (containers)")"
  if [[ "${selected_mode}" == "PM2 (Node.js no host)" ]]; then
    MODE="pm2"
  else
    MODE="docker"
  fi

  INSTALL_DIR="$(ask_with_default "Diretorio da instalacao" "${DEFAULT_INSTALL_DIR}")"
  APP_USER="$(ask_with_default "Usuario Linux dono do app" "${APP_USER}")"

  REMOVE_APP_DIR="$(ask_yes_no "Deseja remover o diretorio da aplicacao?" "yes")"
  REMOVE_NGINX="$(ask_yes_no "Deseja remover a configuracao Nginx do app?" "yes")"

  if [[ "${REMOVE_NGINX}" == "yes" ]]; then
    REMOVE_CERTS="$(ask_yes_no "Deseja remover o certificado SSL (Certbot) tambem?" "no")"
    if [[ "${REMOVE_CERTS}" == "yes" ]]; then
      DOMAIN_NAME="$(ask_with_default "Dominio do certificado a remover" "")"
      [[ -z "${DOMAIN_NAME}" ]] && fail "Dominio nao pode ser vazio para remover certificado."
    fi
  fi

  extract_database_info_from_env

  if [[ "${MODE}" == "docker" ]]; then
    REMOVE_DOCKER_VOLUME="$(ask_yes_no "Deseja remover o volume Docker do banco (${DEFAULT_DB_VOLUME})?" "no")"
  else
    REMOVE_LOCAL_DB="$(ask_yes_no "Deseja remover o banco local PostgreSQL do app?" "no")"
    if [[ "${REMOVE_LOCAL_DB}" == "yes" && ( -n "${DB_NAME}" || -n "${DB_USER}" ) ]]; then
      warn "Banco detectado no .env: host=${DB_HOST:-?} porta=${DB_PORT:-?} db=${DB_NAME:-?} user=${DB_USER:-?}"
      if [[ "${DB_HOST}" != "127.0.0.1" && "${DB_HOST}" != "localhost" && "${DB_HOST}" != "" ]]; then
        warn "Host do banco parece externo. Remocao automatica sera ignorada por seguranca."
        REMOVE_LOCAL_DB="no"
      fi
    fi
  fi
}

confirm_and_execute() {
  echo
  echo "Resumo da desinstalacao:"
  echo "  Modo: ${MODE}"
  echo "  Diretorio: ${INSTALL_DIR}"
  echo "  Remover app dir: ${REMOVE_APP_DIR}"
  echo "  Remover Nginx: ${REMOVE_NGINX}"
  if [[ "${MODE}" == "docker" ]]; then
    echo "  Remover volume Docker: ${REMOVE_DOCKER_VOLUME}"
  else
    echo "  Remover banco local: ${REMOVE_LOCAL_DB}"
  fi
  echo

  local proceed
  proceed="$(ask_yes_no "Confirmar desinstalacao?" "no")"
  if [[ "${proceed}" != "yes" ]]; then
    fail "Desinstalacao cancelada."
  fi

  if [[ "${MODE}" == "pm2" ]]; then
    stop_pm2_app
  else
    stop_docker_app
  fi

  drop_local_database_if_requested
  remove_ssl_cert
  remove_nginx_config
  remove_app_dir_if_requested

  echo
  echo "[INFO] Desinstalacao concluida."
}

main() {
  collect_inputs
  confirm_and_execute
}

main "$@"
