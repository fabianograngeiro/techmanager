param()

$ErrorActionPreference = "Stop"

$AppName = "TechManager"
$DefaultRepo = "https://github.com/fabianograngeiro/techmanager.git"
$DefaultPath = "C:\TechManager"
$DefaultPort = 3000

function Write-Info($message) { Write-Host "[INFO] $message" -ForegroundColor Cyan }
function Write-WarnMsg($message) { Write-Host "[WARN] $message" -ForegroundColor Yellow }
function Write-ErrMsg($message) { Write-Host "[ERROR] $message" -ForegroundColor Red }

function Read-Default {
    param(
        [string]$Prompt,
        [string]$DefaultValue
    )

    $value = Read-Host "$Prompt [$DefaultValue]"
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $DefaultValue
    }

    return $value.Trim()
}

function Read-Choice {
    param(
        [string]$Prompt,
        [string[]]$Options
    )

    while ($true) {
        Write-Host $Prompt
        for ($i = 0; $i -lt $Options.Count; $i++) {
            Write-Host "  $($i + 1)) $($Options[$i])"
        }

        $answer = Read-Host "Escolha uma opcao"
        $parsed = 0
        if ([int]::TryParse($answer, [ref]$parsed)) {
            if ($parsed -ge 1 -and $parsed -le $Options.Count) {
                return $Options[$parsed - 1]
            }
        }

        Write-WarnMsg "Opcao invalida. Tente novamente."
    }
}

function Ensure-Winget {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "Winget nao encontrado. Atualize o App Installer da Microsoft Store e execute novamente."
    }
}

function Ensure-Command {
    param(
        [string]$CommandName,
        [string]$WingetId,
        [string]$Label
    )

    if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
        Write-Info "$Label ja instalado."
        return
    }

    Write-Info "Instalando $Label via winget"
    winget install -e --id $WingetId --accept-source-agreements --accept-package-agreements
}

function Set-EnvValue {
    param(
        [string]$FilePath,
        [string]$Key,
        [string]$Value
    )

    if (-not (Test-Path $FilePath)) {
        New-Item -ItemType File -Path $FilePath -Force | Out-Null
    }

    $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { $content = "" }

    $lineValue = '{0}="{1}"' -f $Key, $Value

    if ($content -match "(?m)^$Key=") {
        $updated = [Regex]::Replace($content, "(?m)^$Key=.*$", $lineValue)
        Set-Content -Path $FilePath -Value $updated
    }
    else {
        Add-Content -Path $FilePath -Value $lineValue
    }
}

function Prepare-Repository {
    param(
        [string]$RepoUrl,
        [string]$Path
    )

    if (Test-Path (Join-Path $Path ".git")) {
        Write-Info "Repositorio ja existe em $Path. Atualizando para origin/main"
        git -C $Path fetch --all --prune
        git -C $Path reset --hard origin/main
    }
    else {
        if (-not (Test-Path $Path)) {
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
        }
        else {
            Remove-Item -Path $Path -Recurse -Force
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
        }

        Write-Info "Clonando repositorio em $Path"
        git clone $RepoUrl $Path
    }
}

function Ensure-DockerRunning {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Ensure-Command -CommandName "docker" -WingetId "Docker.DockerDesktop" -Label "Docker Desktop"
        Write-WarnMsg "Docker Desktop instalado. Abra o Docker Desktop e aguarde iniciar antes de continuar."
    }

    try {
        docker info | Out-Null
    }
    catch {
        Write-WarnMsg "Docker nao esta ativo. Iniciando Docker Desktop."
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 10
    }
}

function Start-PostgresContainer {
    param(
        [string]$DbName,
        [string]$DbUser,
        [string]$DbPass,
        [int]$DbPort
    )

    Ensure-DockerRunning

    Write-Info "Subindo PostgreSQL via Docker"
    docker rm -f techmanager-postgres 2>$null | Out-Null
    docker volume create techmanager_pgdata 2>$null | Out-Null

    docker run -d `
        --name techmanager-postgres `
        --restart always `
        -e POSTGRES_DB=$DbName `
        -e POSTGRES_USER=$DbUser `
        -e POSTGRES_PASSWORD=$DbPass `
        -p "$DbPort:5432" `
        -v techmanager_pgdata:/var/lib/postgresql/data `
        postgres:15 | Out-Null
}

function Write-DockerfileIfMissing {
    param([string]$RepoPath)

    $dockerfile = Join-Path $RepoPath "Dockerfile"
    if (-not (Test-Path $dockerfile)) {
        @"
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "NODE_ENV=production npx tsx server.ts"]
"@ | Set-Content $dockerfile
    }
}

function Start-DockerStack {
    param(
        [string]$RepoPath,
        [bool]$UseExternalDb,
        [string]$DatabaseUrl,
        [string]$DbName,
        [string]$DbUser,
        [string]$DbPass
    )

    Ensure-DockerRunning
    Write-DockerfileIfMissing -RepoPath $RepoPath

    $composePath = Join-Path $RepoPath "docker-compose.installer.yml"

    if ($UseExternalDb) {
        @"
services:
  techmanager:
    build: .
    container_name: techmanager-app
    restart: always
    environment:
      - PORT=3000
      - NODE_ENV=production
      - DATABASE_URL=$DatabaseUrl
    ports:
      - "3000:3000"
"@ | Set-Content $composePath
    }
    else {
        @"
services:
  postgres:
    image: postgres:15
    container_name: techmanager-postgres
    restart: always
    environment:
      POSTGRES_DB: $DbName
      POSTGRES_USER: $DbUser
      POSTGRES_PASSWORD: $DbPass
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
    - DATABASE_URL=postgresql://${DbUser}:${DbPass}@postgres:5432/${DbName}?schema=public
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  techmanager_pgdata:
"@ | Set-Content $composePath
    }

    Push-Location $RepoPath
    docker compose -f docker-compose.installer.yml up -d --build
    Pop-Location
}

function Start-PM2App {
    param([string]$RepoPath)

    Ensure-Command -CommandName "pm2" -WingetId "OpenJS.NodeJS.LTS" -Label "Node.js LTS"

    Push-Location $RepoPath
    npm install
    npm run build

    if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
        npm install -g pm2
    }

    pm2 delete techmanager 2>$null | Out-Null
    pm2 start "npx tsx server.ts" --name techmanager --time --update-env
    pm2 save
    Pop-Location
}

function Configure-Caddy {
    param(
        [string]$RepoPath,
        [string]$Domain
    )

    Ensure-Command -CommandName "caddy" -WingetId "CaddyServer.Caddy" -Label "Caddy"

    $caddyFile = Join-Path $RepoPath "Caddyfile"
    @"
$Domain {
  reverse_proxy localhost:3000
}
"@ | Set-Content $caddyFile

    caddy stop 2>$null | Out-Null
    caddy start --config $caddyFile --adapter caddyfile
}

try {
    Write-Info "Iniciando instalador do $AppName para Windows"
    Ensure-Winget

    $mode = Read-Choice -Prompt "Escolha o modo de publicacao" -Options @("Docker", "PM2")
    $accessMode = Read-Choice -Prompt "Como deseja acessar o sistema" -Options @("Local IP", "Dominio VPS")
    $dbMode = Read-Choice -Prompt "Como configurar o banco" -Options @("PostgreSQL Docker", "PostgreSQL Externo")

    $repoUrl = Read-Default -Prompt "URL do repositorio" -DefaultValue $DefaultRepo
    $repoPath = Read-Default -Prompt "Pasta de instalacao" -DefaultValue $DefaultPath

    $dbName = Read-Default -Prompt "Nome do banco" -DefaultValue "techmanager_db"
    $dbUser = Read-Default -Prompt "Usuario do banco" -DefaultValue "techuser"
    $dbPassDefault = [Guid]::NewGuid().ToString("N").Substring(0, 20)
    $dbPass = Read-Default -Prompt "Senha do banco" -DefaultValue $dbPassDefault
    $dbPort = [int](Read-Default -Prompt "Porta do banco" -DefaultValue "5432")

    $externalDbUrl = ""
    $useExternalDb = $false
    if ($dbMode -eq "PostgreSQL Externo") {
        $useExternalDb = $true
        $externalDbUrl = Read-Host "Informe DATABASE_URL completa"
        if ([string]::IsNullOrWhiteSpace($externalDbUrl)) {
            throw "DATABASE_URL externa e obrigatoria nesse modo."
        }
    }

    $domain = ""
    if ($accessMode -eq "Dominio VPS") {
        $domain = Read-Host "Digite o dominio (exemplo: app.seudominio.com)"
        if ([string]::IsNullOrWhiteSpace($domain)) {
            throw "Dominio obrigatorio para esse modo."
        }
    }

    Ensure-Command -CommandName "git" -WingetId "Git.Git" -Label "Git"
    Ensure-Command -CommandName "node" -WingetId "OpenJS.NodeJS.LTS" -Label "Node.js LTS"

    Prepare-Repository -RepoUrl $repoUrl -Path $repoPath

    if (-not $useExternalDb -and $mode -eq "PM2") {
        Start-PostgresContainer -DbName $dbName -DbUser $dbUser -DbPass $dbPass -DbPort $dbPort
    }

    $appUrl = ""
    if ($accessMode -eq "Dominio VPS") {
        $appUrl = "https://$domain"
    }
    else {
        $appUrl = "http://localhost"
    }

    $databaseUrl = ""
    if ($useExternalDb) {
        $databaseUrl = $externalDbUrl
    }
    elseif ($mode -eq "Docker") {
        $databaseUrl = "postgresql://${dbUser}:${dbPass}@postgres:5432/${dbName}?schema=public"
    }
    else {
        $databaseUrl = "postgresql://${dbUser}:${dbPass}@127.0.0.1:$dbPort/${dbName}?schema=public"
    }

    $verifyToken = "tech-manager-" + [Guid]::NewGuid().ToString("N").Substring(0, 12)

    $envPath = Join-Path $repoPath ".env"
    if (-not (Test-Path $envPath)) {
        $examplePath = Join-Path $repoPath ".env.example"
        if (Test-Path $examplePath) {
            Copy-Item $examplePath $envPath -Force
        }
        else {
            New-Item -ItemType File -Path $envPath | Out-Null
        }
    }

    Set-EnvValue -FilePath $envPath -Key "APP_URL" -Value $appUrl
    Set-EnvValue -FilePath $envPath -Key "DATABASE_URL" -Value $databaseUrl
    Set-EnvValue -FilePath $envPath -Key "WHATSAPP_VERIFY_TOKEN" -Value $verifyToken

    if ($mode -eq "Docker") {
        Start-DockerStack -RepoPath $repoPath -UseExternalDb:$useExternalDb -DatabaseUrl $externalDbUrl -DbName $dbName -DbUser $dbUser -DbPass $dbPass
    }
    else {
        Start-PM2App -RepoPath $repoPath
    }

    if ($accessMode -eq "Dominio VPS") {
        Configure-Caddy -RepoPath $repoPath -Domain $domain
    }

    Write-Host ""
    Write-Info "Instalacao concluida"
    Write-Info "URL esperada: $appUrl"
    if ($mode -eq "Docker") {
        Write-Info "Para validar containers: docker ps"
    }
    else {
        Write-Info "Para validar processo: pm2 status"
    }
}
catch {
    Write-ErrMsg $_.Exception.Message
    exit 1
}
