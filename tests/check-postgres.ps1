$ErrorActionPreference = "Stop"

Write-Host "=== Verificando PostgreSQL ===" -ForegroundColor Cyan

# Verificar si pg_ctl existe (PostgreSQL instalado)
if (Test-Path "C:\Program Files\PostgreSQL") {
    Write-Host "✅ PostgreSQL instalado en: C:\Program Files\PostgreSQL" -ForegroundColor Green
    
    # Intentar conectar con psql
    try {
        $result = & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -c "SELECT version();" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL v17 conectado correctamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error conectando a PostgreSQL" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  PostgreSQL no encontrado, verificando versión..." -ForegroundColor Yellow
}

# Verificar si el puerto 5432 está en uso
try {
    $tcp = [System.Net.Sockets.TcpClient]::new()
    $tcp.Connect("127.0.0.1", 5432)
    Write-Host "✅ Puerto 5432 (PostgreSQL) disponible" -ForegroundColor Green
    $tcp.Close()
} catch {
    Write-Host "❌ Puerto 5432 no disponible - PostgreSQL no está corriendo" -ForegroundColor Red
}

Write-Host "`n=== Estado del sistema ===" -ForegroundColor Cyan
Write-Host "Backend .NET compilado: bin/Debug/net10.0/MundoFelino.Api.dll" -ForegroundColor Green