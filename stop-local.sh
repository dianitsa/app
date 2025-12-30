#!/bin/bash

echo "🛑 Parando Sistema Local..."

# Para o MongoDB
echo "   Parando MongoDB..."
docker-compose down

# Para processos Node e Python
echo "   Parando Backend e Frontend..."
pkill -f "uvicorn"
pkill -f "react-scripts"
pkill -f "node"

echo "✅ Sistema parado com sucesso!"