# Script para inicializar base de datos PostgreSQL con datos de prueba
# Ejecutar después de instalar PostgreSQL en Windows

Write-Host "=== Inicializando Base de Datos Mundo Felino ===" -ForegroundColor Cyan

# Verificar si PostgreSQL está instalado
$pgVersion = "18"
$pgPath = "C:\Program Files\PostgreSQL\$pgVersion\bin\psql.exe"

if (Test-Path $pgPath) {
    Write-Host "✅ PostgreSQL $pgVersion encontrado en: $pgPath" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL no instalado o ruta incorrecta" -ForegroundColor Red
    Write-Host "Instala desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Conectar a base de datos (creada automáticamente el primer uso)
Write-Host "`nConectando a PostgreSQL..." -ForegroundColor Cyan

# Crear base de datos si no existe y ejecutar script SQL
$connectionString = "Host=localhost;Database=postgres;Username=postgres;Password=postgres"

$command = @'
-- Conectar a postgres por defecto
\c postgres

-- Crear base de datos mundofelino si no existe
DROP DATABASE IF EXISTS mundofelino;
CREATE DATABASE mundofelino WITH OWNER mundofelino_app;

-- Conectar a mundofelino
\c mundofelino

-- Ejecutar script SQL para crear tablas e insertar datos
\i database.sql
'@

& $pgPath -f $command -U postgres 2>&1 | Tee-Object -Variable dbOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Base de datos inicializada exitosamente!" -ForegroundColor Green
    Write-Host "   - Tablas creadas: clinics, articles, libraries" -ForegroundColor Green
    Write-Host "   - Datos insertados: 6 veterinarios + 5 artículos + 3 bibliotecas" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error al inicializar base de datos:" -ForegroundColor Red
    Write-Host $dbOutput -ForegroundColor Red
}

Write-Host "`n=== Inicialización Completada ===" -ForegroundColor Cyan
