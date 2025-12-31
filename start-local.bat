@echo off
echo ============================================
echo   SISTEMA DE PATRIMONIO - AMBIENTE LOCAL
echo ============================================
echo.

REM Verifica se o Docker esta rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Docker nao esta rodando. Por favor, inicie o Docker Desktop.
    pause
    exit /b 1
)

echo [1/3] Iniciando MongoDB...
docker-compose up -d
timeout /t 3 >nul

echo [OK] MongoDB rodando em localhost:27017
echo.

echo [2/3] Iniciando Backend...
start "Backend" cmd /k "cd backend && .\start-local.bat"
timeout /t 5 >nul

echo.
echo [3/3] Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && .\start-local.bat"

echo.
echo ============================================
echo   SISTEMA INICIADO COM SUCESSO!
echo ============================================
echo.
echo Acesse o sistema:
echo   Frontend Admin: http://localhost:3000
echo   Pagina Publica: http://localhost:3000/solicitar-emprestimo
echo   API Docs:       http://localhost:8001/docs
echo.
echo Login Padrao:
echo   Usuario: dedianit
echo   Senha:   diadema123
echo.
echo Para parar o sistema:
echo   Execute: stop-local.bat
echo ============================================
echo.
pause