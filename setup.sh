#!/bin/bash

# ==============================================
# Script de Setup - Ipiranga Fitness
# ==============================================

echo "╔══════════════════════════════════════════╗"
echo "║     Ipiranga Fitness - Setup Script     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${YELLOW}Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale o Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) encontrado${NC}"

# Verificar MySQL
echo -e "${YELLOW}Verificando MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠ MySQL CLI não encontrado. Certifique-se de ter o MySQL 8.0+ instalado${NC}"
else
    echo -e "${GREEN}✓ MySQL encontrado${NC}"
fi

echo ""
echo -e "${YELLOW}═══ CONFIGURAÇÃO DO BACKEND ═══${NC}"
echo ""

cd backend

# Instalar dependências do backend
echo -e "${YELLOW}Instalando dependências do backend...${NC}"
npm install
echo -e "${GREEN}✓ Dependências instaladas${NC}"

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo -e "${YELLOW}Criando arquivo .env...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
    echo -e "${RED}⚠ IMPORTANTE: Edite o arquivo backend/.env com suas configurações de banco de dados${NC}"
fi

cd ..

echo ""
echo -e "${YELLOW}═══ CONFIGURAÇÃO DO FRONTEND ═══${NC}"
echo ""

cd frontend

# Instalar dependências do frontend
echo -e "${YELLOW}Instalando dependências do frontend...${NC}"
npm install
echo -e "${GREEN}✓ Dependências instaladas${NC}"

# Criar arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Criando arquivo .env.local...${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
    echo -e "${GREEN}✓ Arquivo .env.local criado${NC}"
fi

cd ..

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Setup Concluído! 🎉                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo ""
echo "1. Configure o banco de dados MySQL:"
echo "   mysql -u root -p -e 'CREATE DATABASE ipiranga_fitness;'"
echo ""
echo "2. Edite o arquivo ${GREEN}backend/.env${NC} com suas credenciais"
echo ""
echo "3. Execute as migrations e seeds:"
echo "   cd backend"
echo "   npm run migrate"
echo "   npm run seed"
echo ""
echo "4. Inicie o backend:"
echo "   cd backend && npm run dev"
echo ""
echo "5. Em outro terminal, inicie o frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo -e "${YELLOW}Acessos:${NC}"
echo "   Site:  http://localhost:3000"
echo "   Admin: http://localhost:3000/admin"
echo "   API:   http://localhost:3001/api"
echo ""
echo -e "${YELLOW}Credenciais do Admin:${NC}"
echo "   Email: admin@equipamentosipiranga.com.br"
echo "   Senha: admin123"
echo ""
