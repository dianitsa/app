# Sistema de Controle de Patrimônio e Empréstimos de TI

## 📋 Descrição

Sistema completo de gerenciamento de patrimônio de equipamentos de TI com controle de empréstimos, rastreamento de localização, responsáveis e histórico completo de movimentações.

## ✨ Funcionalidades

### 👨‍💼 Para Administradores:
- ✅ Dashboard com visão geral do inventário
- ✅ Cadastro completo de equipamentos (notebook, desktop, celular, etc)
- ✅ Controle de empréstimos com múltiplos equipamentos
- ✅ Gerenciamento de devoluções
- ✅ Histórico de movimentações por equipamento
- ✅ Upload de termos de responsabilidade (PDF)
- ✅ Exportação de relatórios em Excel
- ✅ Importação em lote via Excel
- ✅ Notificações internas
- ✅ Controle de equipamentos atrasados

### 👥 Para Usuários:
- ✅ Página pública para solicitar empréstimos
- ✅ Busca de equipamentos disponíveis
- ✅ Seleção de múltiplos equipamentos
- ✅ Confirmação automática de solicitação

## 🛠️ Tecnologias Utilizadas

### Backend:
- **FastAPI** (Python) - API REST moderna e rápida
- **MongoDB** - Banco de dados NoSQL
- **Motor** - Driver assíncrono para MongoDB
- **JWT** - Autenticação segura
- **Pandas** - Processamento de Excel
- **Pydantic** - Validação de dados

### Frontend:
- **React** - Interface moderna e responsiva
- **React Router** - Navegação SPA
- **Axios** - Requisições HTTP
- **Shadcn/UI** - Componentes modernos
- **Tailwind CSS** - Estilização
- **Lucide Icons** - Ícones
- **Sonner** - Notificações toast

## 🚀 Rodar Localmente

### Pré-requisitos:
- Docker Desktop
- Python 3.9+
- Node.js 16+
- Yarn

### Início Rápido:
```bash
# Clone o repositório
git clone seu-repositorio.git
cd seu-repositorio

# Inicie tudo com um comando
./start-local.sh
```

**Acesse:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs
- Página Pública: http://localhost:3000/solicitar-emprestimo

**Login padrão:**
- Usuário: `dedianit`
- Senha: `diadema123`

### Parar o sistema:
```bash
./stop-local.sh
```

## 📚 Documentação Completa

Veja [README-LOCAL.md](README-LOCAL.md) para instruções detalhadas de configuração local.

## 🌐 Deploy para Produção

### Opção 1: Render + Vercel + MongoDB Atlas (Recomendado)

#### MongoDB Atlas:
1. Criar conta gratuita em https://mongodb.com/cloud/atlas
2. Criar cluster M0 (grátis 512MB)
3. Copiar connection string

#### Backend no Render:
1. Criar conta em https://render.com
2. New Web Service → Conectar GitHub
3. Configurar:
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Adicionar variáveis (ver `.env.production.example`)

#### Frontend no Vercel:
1. Criar conta em https://vercel.com
2. Import Project → Conectar GitHub
3. Configurar:
   - Root Directory: `frontend`
   - Framework: Create React App
4. Adicionar variável: `REACT_APP_BACKEND_URL`

### Opção 2: Railway (Tudo em um)
1. Criar conta em https://railway.app
2. New Project → Deploy from GitHub
3. Adicionar MongoDB do catálogo
4. Criar 2 serviços (backend e frontend)
5. Configurar variáveis de ambiente

### Opção 3: Deploy Nativo Emergent
1. Botão "Deploy" na plataforma Emergent
2. Tudo configurado automaticamente

## 📂 Estrutura do Projeto

```
patrimonio-sistema/
├── backend/                 # API FastAPI
│   ├── server.py           # Código principal
│   ├── requirements.txt    # Dependências Python
│   ├── .env.local         # Config local
│   └── .env.production.example
├── frontend/               # React App
│   ├── src/
│   │   ├── pages/         # Páginas
│   │   ├── components/    # Componentes
│   │   └── App.js         # App principal
│   ├── package.json
│   ├── .env.local
│   └── .env.production.example
├── docker-compose.yml     # MongoDB local
├── start-local.sh         # Iniciar local
├── stop-local.sh          # Parar local
└── README.md              # Este arquivo
```

## 🗄️ Modelo de Dados

### Collections MongoDB:

**users** - Usuários do sistema
```json
{
  "id": "uuid",
  "username": "string",
  "password": "hashed",
  "role": "admin|user"
}
```

**equipments** - Equipamentos
```json
{
  "id": "uuid",
  "numero_patrimonio": "string",
  "numero_serie": "string",
  "marca": "string",
  "modelo": "string",
  "tipo_equipamento": "string",
  "departamento_atual": "string",
  "responsavel_atual": "string?",
  "termo_responsabilidade": "base64?",
  "status": "Disponível|Em uso|Emprestado|Manutenção|Baixado",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**loans** - Empréstimos
```json
{
  "id": "uuid",
  "data_emprestimo": "datetime",
  "nome_solicitante": "string",
  "departamento_solicitante": "string",
  "data_prevista_devolucao": "datetime",
  "data_devolucao_real": "datetime?",
  "status_devolucao": "Pendente|Devolvido|Atrasado",
  "equipments": ["PAT-001", "PAT-002"],
  "created_at": "datetime"
}
```

**equipment_history** - Histórico
```json
{
  "id": "uuid",
  "equipment_id": "string",
  "action": "created|updated|loaned|returned|termo_uploaded",
  "description": "string",
  "user": "string",
  "timestamp": "datetime"
}
```

**notifications** - Notificações
```json
{
  "id": "uuid",
  "user_id": "string",
  "message": "string",
  "type": "loan_created|loan_returned|loan_overdue",
  "read": "boolean",
  "created_at": "datetime"
}
```

## 🔌 API Endpoints

### Autenticação:
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual

### Equipamentos:
- `GET /api/equipments` - Listar (com filtros)
- `POST /api/equipments` - Criar
- `GET /api/equipments/{id}` - Obter um
- `PUT /api/equipments/{id}` - Atualizar
- `DELETE /api/equipments/{id}` - Deletar
- `POST /api/equipments/{id}/upload-termo` - Upload PDF
- `GET /api/equipments/{id}/history` - Histórico

### Empréstimos:
- `GET /api/loans` - Listar (com filtros)
- `POST /api/loans` - Criar
- `GET /api/loans/{id}` - Obter um
- `PUT /api/loans/{id}/return` - Devolver

### Público (sem auth):
- `GET /api/public/equipments/available` - Equipamentos disponíveis
- `POST /api/public/loan-request` - Solicitar empréstimo

### Relatórios:
- `GET /api/export/equipments` - Exportar Excel
- `GET /api/export/loans` - Exportar empréstimos
- `GET /api/export/equipments/template` - Template Excel
- `POST /api/import/equipments` - Importar Excel

### Dashboard:
- `GET /api/dashboard/stats` - Estatísticas

### Notificações:
- `GET /api/notifications` - Listar
- `PUT /api/notifications/{id}/read` - Marcar como lida

## 📝 Licença

Este projeto foi desenvolvido para controle interno de patrimônio de TI.

## 👨‍💻 Autor

[Seu Nome]

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

**Desenvolvido com ❤️ usando FastAPI + React**