# 🏠 Sistema de Patrimônio - Configuração Local

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### **Obrigatório:**
- ✅ **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- ✅ **Python 3.9+** - [Download](https://www.python.org/downloads/)
- ✅ **Node.js 16+** - [Download](https://nodejs.org/)
- ✅ **Yarn** - Instale com: `npm install -g yarn`

### **Verificar instalações:**
```bash
docker --version
python3 --version
node --version
yarn --version
```

---

## 🚀 Iniciar Sistema Local (Modo Rápido)

### **Opção 1: Script Automático (Recomendado)**

```bash
# Dar permissão aos scripts
chmod +x start-local.sh
chmod +x stop-local.sh

# Iniciar tudo
./start-local.sh
```

✅ **Pronto!** O sistema estará rodando em:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs
- **MongoDB:** localhost:27017

---

### **Opção 2: Iniciar Manualmente**

#### **1. Iniciar MongoDB:**
```bash
docker-compose up -d
```

#### **2. Iniciar Backend:**
```bash
cd backend

# Criar ambiente virtual (primeira vez)
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Carregar variáveis de ambiente e iniciar
export $(cat .env.local | xargs)  # No Windows: use set
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### **3. Iniciar Frontend (nova janela do terminal):**
```bash
cd frontend

# Instalar dependências
yarn install

# Carregar variáveis de ambiente e iniciar
export $(cat .env.local | xargs)  # No Windows: use set
yarn start
```

---

## 🛑 Parar o Sistema

### **Opção 1: Script Automático**
```bash
./stop-local.sh
```

### **Opção 2: Manual**
- Pressione `Ctrl+C` nos terminais do backend e frontend
- Pare o MongoDB: `docker-compose down`

---

## 👤 Login Padrão

**Usuário:** `dedianit`  
**Senha:** `diadema123`

---

## 📁 Estrutura de Arquivos

```
patrimonio-sistema/
├── backend/
│   ├── server.py              # API FastAPI
│   ├── requirements.txt       # Dependências Python
│   ├── .env.local            # Config local
│   └── start-local.sh        # Script de inicialização
├── frontend/
│   ├── src/                  # Código React
│   ├── package.json          # Dependências Node
│   ├── .env.local           # Config local
│   └── start-local.sh       # Script de inicialização
├── docker-compose.yml        # MongoDB local
├── start-local.sh           # Iniciar tudo
├── stop-local.sh            # Parar tudo
└── README-LOCAL.md          # Este arquivo
```

---

## 🌐 Preparar para Deploy Online

Quando quiser subir o sistema online:

### **1. MongoDB Atlas (Banco Online):**
- Criar conta em: https://www.mongodb.com/cloud/atlas
- Copiar connection string
- Substituir `MONGO_URL` nos arquivos `.env` de produção

### **2. Backend (Render):**
- Enviar código para GitHub
- Criar conta em: https://render.com
- Criar Web Service apontando para pasta `backend`
- Adicionar variáveis de ambiente

### **3. Frontend (Vercel):**
- Criar conta em: https://vercel.com
- Importar repositório
- Configurar `Root Directory: frontend`
- Adicionar `REACT_APP_BACKEND_URL` com URL do Render

---

## 🔧 Configurações

### **Backend (.env.local):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=patrimonio_local_db
CORS_ORIGINS=*
JWT_SECRET_KEY=patrimonio-local-dev-key-2025
PORT=8001
```

### **Frontend (.env.local):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3000
```

---

## 📊 Acessar MongoDB Local

### **Via MongoDB Compass:**
1. Baixar: https://www.mongodb.com/products/compass
2. Conectar em: `mongodb://localhost:27017`
3. Banco: `patrimonio_local_db`

### **Via Terminal:**
```bash
docker exec -it patrimonio_mongodb mongosh
use patrimonio_local_db
show collections
```

---

## 🐛 Solução de Problemas

### **Erro: "Docker não está rodando"**
- Inicie o Docker Desktop
- Aguarde aparecer o ícone verde

### **Erro: "Porta 8001 já está em uso"**
```bash
# Mac/Linux
lsof -ti:8001 | xargs kill -9

# Windows
netstat -ano | findstr :8001
taskkill /PID [número_do_pid] /F
```

### **Erro: "MongoDB connection failed"**
- Verifique se o Docker está rodando
- Execute: `docker-compose up -d`
- Aguarde 10 segundos e tente novamente

### **Erro: "Module not found"**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
yarn install
```

---

## 📝 Notas Importantes

- ✅ Os dados ficam salvos no Docker volume `mongodb_data`
- ✅ Você pode parar e iniciar sem perder dados
- ✅ Para resetar o banco: `docker-compose down -v`
- ✅ Logs do backend: aparecem no terminal
- ✅ Logs do frontend: aparecem no navegador

---

## 🆘 Suporte

Se tiver problemas:
1. Verifique os pré-requisitos instalados
2. Consulte a seção de problemas acima
3. Verifique os logs nos terminais

---

**Sistema criado por:** [Seu Nome]  
**Última atualização:** Dezembro 2025