#!/bin/bash

# ===========================================
# Script de Deploy - RDV Discos Frontend
# ===========================================
# 
# USO:
#   1. No servidor VPS, clone o repositório ou envie os arquivos
#   2. Execute: chmod +x deploy.sh && ./deploy.sh
#
# PRÉ-REQUISITOS NO VPS:
#   - Node.js 18+ (recomendado 20 LTS)
#   - npm ou yarn
#   - PM2 (instalado globalmente)
#   - Nginx
#
# ===========================================

set -e  # Para o script se houver erro

echo "=========================================="
echo "  RDV Discos - Deploy Frontend Nuxt"
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do projeto (ajuste se necessário)
PROJECT_DIR=$(pwd)
APP_NAME="rdv-frontend"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Erro: Node.js não está instalado${NC}"
    echo "Instale com: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

echo -e "${GREEN}Node.js versão:${NC} $(node -v)"
echo -e "${GREEN}npm versão:${NC} $(npm -v)"

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 não encontrado. Instalando...${NC}"
    npm install -g pm2
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        echo -e "${YELLOW}Copiando .env.production para .env${NC}"
        cp .env.production .env
        echo -e "${RED}ATENÇÃO: Edite o arquivo .env com suas configurações reais!${NC}"
        echo "Execute: nano .env"
    else
        echo -e "${RED}Erro: Arquivo .env não encontrado${NC}"
        echo "Crie o arquivo .env com NUXT_PUBLIC_API_BASE=https://sua-api.com/api"
        exit 1
    fi
fi

# Instalar dependências
echo ""
echo -e "${GREEN}[1/4] Instalando dependências...${NC}"
npm ci --production=false

# Build do projeto
echo ""
echo -e "${GREEN}[2/4] Gerando build de produção...${NC}"
npm run build

# Verificar se o build foi gerado
if [ ! -d ".output" ]; then
    echo -e "${RED}Erro: Build falhou - pasta .output não encontrada${NC}"
    exit 1
fi

# Parar aplicação existente (se houver)
echo ""
echo -e "${GREEN}[3/4] Configurando PM2...${NC}"
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# Iniciar com PM2
pm2 start .output/server/index.mjs --name $APP_NAME --env production

# Salvar configuração do PM2
pm2 save

# Configurar startup (para reiniciar após reboot)
echo ""
echo -e "${YELLOW}Para configurar inicialização automática, execute:${NC}"
echo "pm2 startup"
echo "(e siga as instruções)"

# Status
echo ""
echo -e "${GREEN}[4/4] Deploy concluído!${NC}"
echo ""
pm2 status

echo ""
echo "=========================================="
echo -e "${GREEN}  Deploy finalizado com sucesso!${NC}"
echo "=========================================="
echo ""
echo "Comandos úteis:"
echo "  pm2 logs $APP_NAME     - Ver logs"
echo "  pm2 restart $APP_NAME  - Reiniciar"
echo "  pm2 stop $APP_NAME     - Parar"
echo "  pm2 monit              - Monitor em tempo real"
echo ""
echo -e "${YELLOW}Próximo passo: Configure o Nginx como proxy reverso${NC}"
echo "Veja o arquivo nginx.conf.example"
