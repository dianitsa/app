#!/bin/bash

echo "🎨 Iniciando Frontend Local..."

# Carrega variáveis de ambiente locais
export $(cat .env.local | xargs)

# Instala dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    yarn install
fi

echo "✅ Frontend rodando em http://localhost:3000"
echo "🔗 Página pública: http://localhost:3000/solicitar-emprestimo"

# Inicia o servidor
yarn start