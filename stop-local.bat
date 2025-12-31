@echo off
echo Parando Sistema Local...

echo   Parando MongoDB...
docker-compose down

echo   Parando Backend e Frontend...
taskkill /F /FI "WINDOWTITLE eq Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Frontend*" >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo.
echo [OK] Sistema parado com sucesso!
pause