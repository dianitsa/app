#!/bin/bash

echo "═══════════════════════════════════════════════"
echo "  🏠 SISTEMA DE PATRIMÔNIO - AMBIENTE LOCAL"
echo "═══════════════════════════════════════════════"
echo ""

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

echo "1️⃣  Iniciando MongoDB..."
docker-compose up -d
sleep 3

echo "✅ MongoDB rodando em localhost:27017"
echo ""

echo "2️⃣  Iniciando Backend..."
cd backend
chmod +x start-local.sh
./start-local.sh &
BACKEND_PID=$!
cd ..
sleep 5

echo ""
echo "3️⃣  Iniciando Frontend..."
cd frontend
chmod +x start-local.sh
./start-local.sh &
FRONTEND_PID=$!
cd ..

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ SISTEMA INICIADO COM SUCESSO!"
echo "═══════════════════════════════════════════════"
echo ""
echo "🌐 Acesse o sistema:"
echo "   Frontend Admin: http://localhost:3000"
echo "   Página Pública: http://localhost:3000/solicitar-emprestimo"
echo "   API Docs:       http://localhost:8001/docs"
echo ""
echo "👤 Login Padrão:"
echo "   Usuário: dedianit"
echo "   Senha:   diadema123"
echo ""
echo "🛑 Para parar o sistema:"
echo "   Pressione Ctrl+C ou execute: ./stop-local.sh"
echo "═══════════════════════════════════════════════"
echo ""

# Aguarda até receber Ctrl+C
wait