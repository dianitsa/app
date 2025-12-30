# 🚀 Guia Rápido de Deploy

## 📋 Checklist Antes do Deploy

- [ ] Código enviado para GitHub
- [ ] MongoDB Atlas configurado
- [ ] Variáveis de ambiente preparadas
- [ ] Testado localmente

---

## 🌐 Opção 1: Render + Vercel (Recomendado)

### Passo 1: MongoDB Atlas (5 minutos)

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie cluster M0 FREE
3. Crie usuário do banco
4. Adicione IP 0.0.0.0/0 na whitelist
5. Copie a connection string:
```
mongodb+srv://usuario:senha@cluster.mongodb.net/patrimonio_db?retryWrites=true&w=majority
```

### Passo 2: Deploy Backend no Render (10 minutos)

1. Acesse: https://render.com
2. New → Web Service
3. Conecte seu repositório GitHub
4. Configure:

```
Name: patrimonio-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
```

5. Environment Variables:
```
MONGO_URL = [sua connection string do Atlas]
DB_NAME = patrimonio_db
CORS_ORIGINS = *
JWT_SECRET_KEY = [crie uma senha forte]
```

6. Create Web Service
7. **Copie a URL gerada** (ex: https://patrimonio-backend.onrender.com)

### Passo 3: Deploy Frontend no Vercel (5 minutos)

1. Acesse: https://vercel.com
2. Add New → Project
3. Import seu repositório GitHub
4. Configure:

```
Framework Preset: Create React App
Root Directory: frontend
Build Command: yarn build
Output Directory: build
```

5. Environment Variables:
```
REACT_APP_BACKEND_URL = [URL do Render que você copiou]
```

6. Deploy
7. **Seu site estará no ar!** 🎉

---

## 🚂 Opção 2: Railway (Tudo em Um)

### Passo 1: Deploy no Railway (15 minutos)

1. Acesse: https://railway.app
2. New Project → Deploy from GitHub repo
3. Selecione seu repositório

### Passo 2: Adicionar MongoDB

1. No projeto, clique em "+ New"
2. Database → MongoDB
3. Copie a MONGO_URL gerada

### Passo 3: Criar Serviço Backend

1. "+ New" → GitHub Repo (mesmo repo)
2. Settings:
```
Root Directory: backend
Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
```
3. Variables:
```
MONGO_URL = [copie do MongoDB do Railway]
DB_NAME = patrimonio_db
CORS_ORIGINS = *
JWT_SECRET_KEY = [senha forte]
```
4. Copie a URL do backend

### Passo 4: Criar Serviço Frontend

1. "+ New" → GitHub Repo (mesmo repo)
2. Settings:
```
Root Directory: frontend
Build Command: yarn build
Start Command: yarn start
```
3. Variables:
```
REACT_APP_BACKEND_URL = [URL do backend]
```

---

## 📊 Comparação de Opções

| Feature | Render + Vercel | Railway | Emergent |
|---------|-----------------|---------|----------|
| **Facilidade** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Gratuito** | ✅ | ✅ (com créditos) | 💰 50 créditos/mês |
| **MongoDB** | Atlas separado | Incluído | Incluído |
| **Performance** | Excelente | Ótima | Excelente |
| **Domínio custom** | ✅ | ✅ | ✅ |

---

## 🔧 Após o Deploy

### Testar o Sistema:

1. Acesse a URL do frontend
2. Teste o login:
   - Usuário: `dedianit`
   - Senha: `diadema123`
3. Crie um equipamento de teste
4. Teste a página pública: `/solicitar-emprestimo`

### Configurar Domínio Próprio (Opcional):

**No Vercel:**
1. Settings → Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

**No Render:**
1. Settings → Custom Domain
2. Adicione seu domínio
3. Configure DNS (CNAME)

---

## 🆘 Troubleshooting

### Backend não conecta no MongoDB:
- Verifique se o IP 0.0.0.0/0 está na whitelist do Atlas
- Confirme a MONGO_URL está correta
- Verifique se o banco existe no Atlas

### Frontend não conecta no backend:
- Confirme REACT_APP_BACKEND_URL está correto
- Verifique CORS_ORIGINS no backend
- Teste o backend direto: `[URL]/docs`

### Erro 502 Bad Gateway:
- Aguarde alguns minutos (serviço iniciando)
- Verifique logs no Render/Railway
- Confirme Start Command está correto

---

## 📝 URLs Importantes

**MongoDB Atlas:** https://cloud.mongodb.com  
**Render:** https://dashboard.render.com  
**Vercel:** https://vercel.com/dashboard  
**Railway:** https://railway.app/dashboard  

---

## ✅ Checklist Final

- [ ] Frontend acessível e carregando
- [ ] Login funcionando
- [ ] Criar equipamento funciona
- [ ] Criar empréstimo funciona
- [ ] Página pública acessível
- [ ] Exportar Excel funciona
- [ ] Notificações aparecem

---

**🎉 Parabéns! Seu sistema está no ar!**

URLs do seu sistema:
- Frontend: [sua-url].vercel.app
- Backend: [sua-url].onrender.com
- API Docs: [backend-url]/docs
- Página Pública: [frontend-url]/solicitar-emprestimo