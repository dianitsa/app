#!/bin/bash

echo "🚀 Iniciando Backend Local..."

# Carrega variáveis de ambiente locais
export $(cat .env.local | xargs)

# Ativa ambiente virtual se existir
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Instala dependências se necessário
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

echo "✅ Backend rodando em http://localhost:8001"
echo "📊 Acesse http://localhost:8001/docs para ver a documentação da API"

# Inicia o servidor
uvicorn server:app --host 0.0.0.0 --port 8001 --reload