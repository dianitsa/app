@echo off
echo Iniciando Frontend Local...
echo.

REM Carrega variaveis de ambiente
for /f "tokens=*" %%a in (.env.local) do set %%a

REM Verifica se node_modules existe
if not exist node_modules (
    echo Instalando dependencias...
    call yarn install
)

echo.
echo [OK] Frontend rodando em http://localhost:3000
echo [OK] Pagina publica: http://localhost:3000/solicitar-emprestimo
echo.

REM Inicia o servidor
call yarn start