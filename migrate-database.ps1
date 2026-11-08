$ErrorActionPreference = "Stop"

Write-Host "=== Migración de Base de Datos Mundo Felino ===" -ForegroundColor Cyan

$sqlFile = "C:/Negocio/MicroappFelina/MundoFelino_MVP/MundoFelino/backend/database.sql"
$dbUsername = "mundofelino_app"
$dbPassword = "MundoFelino2026!Secure"
$databaseName = "mundofelino"

# Verificar si el script SQL existe
if (Test-Path $sqlFile) {
    Write-Host "✅ Script SQL encontrado: $sqlFile" -ForegroundColor Green
} else {
    Write-Host "❌ Script SQL no encontrado: $sqlFile" -ForegroundColor Red
    exit 1
}

# Ejecutar script SQL con psql
try {
    Write-Host "`nEjecutando migración..." -ForegroundColor Yellow
    
    $psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    
    if (Test-Path $psqlPath) {
        # Conectar y ejecutar
        $result = & $psqlPath `
            -U "$dbUsername" `
            -d "$databaseName" `
            -f "$sqlFile" `
            -P "Pager=off" `
            2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Migración completada con éxito!" -ForegroundColor Green
            
            # Verificar tablas creadas
            $verifyResult = & $psqlPath `
                -U "$dbUsername" `
                -d "$databaseName" `
                -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" `
                -P "Pager=off"
            
            Write-Host "`n=== Tablas existentes ===" -ForegroundColor Cyan
            Write-Host $verifyResult
        } else {
            Write-Host "`n❌ Error ejecutando migración:" -ForegroundColor Red
            Write-Host $result
        }
    } else {
        Write-Host "❌ psql.exe no encontrado en: $psqlPath" -ForegroundColor Red
        Write-Host "Instale PostgreSQL o use DBeaver para ejecutar el script SQL." -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    exit 1
}
