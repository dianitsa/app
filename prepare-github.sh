#!/bin/bash

echo "📦 Preparando projeto para GitHub..."
echo ""

# Criar .gitignore se não existir
if [ ! -f .gitignore ]; then
    echo "Criando .gitignore..."
    cp .gitignore.example .gitignore 2>/dev/null || echo "Arquivo .gitignore já existe"
fi

# Verificar se git está inicializado
if [ ! -d .git ]; then
    echo "Inicializando repositório git..."
    git init
    echo "✅ Git inicializado"
else
    echo "✅ Repositório git já existe"
fi

echo ""
echo "⚠️  IMPORTANTE: Antes de fazer commit"
echo ""
echo "1. Verifique se .env.local NÃO está sendo commitado"
echo "2. Configure seus dados no README.md"
echo "3. Remova dados sensíveis de arquivos .env.production.example"
echo ""
echo "Comandos para fazer o primeiro commit:"
echo ""
echo "  git add ."
echo "  git commit -m 'Initial commit - Sistema de Patrimônio'"
echo "  git branch -M main"
echo "  git remote add origin https://github.com/seu-usuario/seu-repositorio.git"
echo "  git push -u origin main"
echo ""
echo "✅ Projeto pronto para ser enviado ao GitHub!"