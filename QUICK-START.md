# 🚀 Guia de Uso Rápido

## 📌 Iniciar o Sistema

### No Linux/Mac:
```bash
./start-local.sh
```

### No Windows:
```cmd
start-local.bat
```

---

## 🔑 Login Padrão

**URL:** http://localhost:3000

```
Usuário: dedianit
Senha:   diadema123
```

---

## 📋 Funcionalidades Principais

### 1️⃣ Adicionar Equipamento

1. Clique em **"Equipamentos"** no menu
2. Clique em **"Adicionar"**
3. Preencha os dados:
   - Número de Patrimônio (obrigatório, único)
   - Número de Série
   - Marca e Modelo
   - Tipo (Notebook, Desktop, etc)
   - Departamento
   - Responsável (opcional)
   - Status
4. Clique em **"Criar"**

### 2️⃣ Importar Equipamentos em Massa

1. Vá em **"Equipamentos"**
2. Clique em **"Importar Excel"**
3. Baixe o template Excel
4. Preencha a planilha
5. Faça upload do arquivo
6. Visualize o resultado da importação

### 3️⃣ Criar Empréstimo (Admin)

1. Clique em **"Empréstimos"** no menu
2. Clique em **"Novo Empréstimo"**
3. Preencha:
   - Nome do solicitante
   - Departamento
   - Datas de empréstimo e devolução
4. Busque e selecione equipamentos
5. Clique em **"Criar Empréstimo"**

### 4️⃣ Solicitar Empréstimo (Usuário Público)

**URL:** http://localhost:3000/solicitar-emprestimo

1. Acesse a página pública (sem login)
2. Preencha seus dados
3. Busque equipamentos disponíveis
4. Selecione os equipamentos desejados
5. Clique em **"Enviar Solicitação"**

### 5️⃣ Devolver Equipamento

1. Vá em **"Empréstimos"**
2. Localize o empréstimo ativo
3. Clique em **"Devolver"**
4. Confirme a data de devolução
5. Pronto! Status atualizado

### 6️⃣ Ver Histórico do Equipamento

1. Vá em **"Equipamentos"**
2. Clique no ícone de **histórico** (relógio)
3. Visualize todas as movimentações

### 7️⃣ Exportar Relatórios

**Equipamentos:**
1. Vá em **"Equipamentos"**
2. Clique em **"Exportar Excel"**
3. Arquivo baixado automaticamente

**Empréstimos:**
1. Vá em **"Empréstimos"**
2. Clique em **"Exportar Excel"**
3. Arquivo baixado automaticamente

### 8️⃣ Anexar Termo de Responsabilidade

1. Edite um equipamento
2. Role até **"Termo de Responsabilidade"**
3. Faça upload do PDF
4. Salve

### 9️⃣ Visualizar Notificações

1. Clique no ícone de **sino** no topo
2. Veja todas as notificações
3. Clique para marcar como lida

---

## 🔍 Funcionalidades de Busca e Filtro

### Equipamentos:
- Busca geral (patrimônio, série, marca, modelo)
- Filtro por tipo
- Filtro por departamento
- Filtro por status

### Empréstimos:
- Busca por solicitante ou departamento
- Filtro por status de devolução

---

## 📊 Dashboard

**Indicadores disponíveis:**
- Total de equipamentos
- Equipamentos disponíveis
- Equipamentos emprestados
- Em manutenção
- Empréstimos ativos
- Empréstimos atrasados

**Tabela de empréstimos recentes**

---

## ⚙️ Campos Obrigatórios

### Equipamento:
- ✅ Número de Patrimônio
- ✅ Número de Série
- ✅ Marca
- ✅ Modelo
- ✅ Tipo de Equipamento
- ✅ Departamento Atual
- ✅ Status

### Empréstimo:
- ✅ Nome do Solicitante
- ✅ Departamento
- ✅ Data do Empréstimo
- ✅ Data Prevista de Devolução
- ✅ Pelo menos 1 equipamento

---

## 🗂️ Departamentos Disponíveis

- AUDITÓRIO
- PROTOCOLO
- SEVESC
- SEGRE
- ECC
- SEPES
- SALA DE APOIO-SUPERVISÃO
- SEFREP
- URE
- AT
- SEINTEC
- VIDEO CONFERENCIA
- SALA DO PREGÃO
- SECOMSE
- SEFIN
- SEAFIN
- SALA DE INFORMÁTICA
- CDP
- SALA DE REUNIÃO
- BIBLIOTECA
- CAPACITAÇÃO 1
- ESE
- Outros

---

## 📦 Tipos de Equipamento

- Notebook
- Desktop
- Celular
- Tablet
- Monitor
- Impressora
- Outros

---

## 🎯 Status dos Equipamentos

- **Disponível** - Pode ser emprestado
- **Em uso** - Em uso permanente
- **Emprestado** - Atualmente emprestado
- **Manutenção** - Em manutenção
- **Baixado** - Removido do inventário

---

## 🔄 Status dos Empréstimos

- **Pendente** - Empréstimo ativo, dentro do prazo
- **Atrasado** - Passou da data prevista de devolução
- **Devolvido** - Equipamento devolvido

---

## 🛑 Parar o Sistema

### Linux/Mac:
```bash
./stop-local.sh
```

### Windows:
```cmd
stop-local.bat
```

---

## 🆘 Atalhos Úteis

| Página | URL |
|--------|-----|
| Dashboard | http://localhost:3000 |
| Equipamentos | http://localhost:3000/equipments |
| Empréstimos | http://localhost:3000/loans |
| Página Pública | http://localhost:3000/solicitar-emprestimo |
| API Docs | http://localhost:8001/docs |
| MongoDB | mongodb://localhost:27017 |

---

## 💡 Dicas

1. **Use a busca** - Digite qualquer palavra-chave para filtrar
2. **Importe em massa** - Use Excel para adicionar muitos equipamentos
3. **Empréstimos múltiplos** - Selecione vários equipamentos de uma vez
4. **Histórico completo** - Cada equipamento tem registro de todas movimentações
5. **Status automático** - Empréstimos ficam "Atrasados" automaticamente
6. **Notificações** - Receba alertas de novos empréstimos e devoluções

---

**📚 Para mais detalhes, consulte README-LOCAL.md**