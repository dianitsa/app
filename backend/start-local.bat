@echo off
echo Iniciando Backend Local...
echo.

REM Carrega variaveis de ambiente
for /f "tokens=*" %%a in (.env.local) do set %%a

REM Verifica se o ambiente virtual existe
if not exist venv (
    echo Criando ambiente virtual...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

echo.
echo [OK] Backend rodando em http://localhost:8001
echo [OK] Acesse http://localhost:8001/docs para ver a documentacao da API
echo.

REM Inicia o servidor
uvicorn server:app --host 0.0.0.0 --port 8001 --reload