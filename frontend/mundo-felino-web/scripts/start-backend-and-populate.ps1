# ==============================================================================
# SCRIPT DE CORRECCIÓN - Iniciar Backend y Agregar Veterinarios
# Ejecutar: powershell -ExecutionPolicy Bypass -File scripts/start-backend-and-populate.ps1
# ==============================================================================

Write-Host "`n" + "=".PadRight(80, '=')
Write-Host "🔧 CORRECIÓN: INICIAR BACKEND Y AGREGAR VETERINARIOS"
Write-Host "=".PadRight(80, '=') + "`n"

# Función para verificar y corregir
function Write-CorrectionStep {
    param($stepName)
    Write-Host "[$stepName]..." -ForegroundColor Cyan
}

try {
    # Paso 1: Verificar si Docker está disponible
    $dockerVersion = docker --version 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker está instalado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker no encontrado. Instala Docker Desktop primero." -ForegroundColor Yellow
        exit 1
    }
    
    # Paso 2: Iniciar contenedores con base de datos y backend
    Write-CorrectionStep "Iniciando Docker containers..."
    docker-compose up -d --build
    
    # Esperar a que los contenedores inicien
    Start-Sleep -Seconds 15
    
    # Paso 3: Verificar estado de contenedores
    Write-Host "`n📊 Verificando estado de contenedores..." -ForegroundColor Cyan
    docker ps --format "table {{.Names}}\t{{.Status}}" | Select-Object -First 10
    
    # Paso 4: Insertar veterinarios manualmente (si no existen)
    Write-CorrectionStep "Verificando si hay datos de veterinarios..."
    
    $clinics = docker exec -i postgres psql -U mundofelino_app -d mundofelino -c "SELECT id, name FROM clinics LIMIT 5" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        # Hay datos
        if ($clinics -notmatch "Empty relation") {
            Write-Host "   ✅ Ya existen veterinarios en la base de datos" -ForegroundColor Green
        } else {
            # No hay datos, insertar algunos
            Write-Host "`n📝 AGREGANDO VETERINARIOS DE EJEMPLO..." -ForegroundColor Yellow
            
            $veterinarios = @"
INSERT INTO clinics (id, name, address, municipality, phone, whatsapp, emergency_available, last_verified_at) VALUES
('1', 'Clínica Veterinaria Central de Caracas', 'Av. Francisco de Miranda #456', 'Chacao', '(0212) 555-1234', 'https://wa.me/584123456789', true, NOW()),
('2', 'Veterinaria Las Mercedes', 'Calle 24 #23-56', 'La Carolina', '(0212) 555-2345', NULL, false, NOW()),
('3', 'Clínica Félina Simón Bolívar', 'Av. Francisco de Miranda #890', 'Chacao', '(0212) 555-3456', 'https://wa.me/584123789012', true, NOW()),
('4', 'Veterinaria Altamiro', 'Urbanización Santa Ana #123', 'Baruta', '(0212) 555-4567', NULL, false, NOW());
"@
            
            docker exec -i postgres psql -U mundofelino_app -d mundofelino -c "$veterinarios" 2>&1
        }
    } else {
        Write-Host "   ⚠️  Error verificando veterinarios: $clinics" -ForegroundColor Yellow
    }
    
    # Paso 5: Verificar conexión del frontend con el backend
    Write-CorrectionStep "Probando conexión frontend-backend..."
    
    $backendUrl = "http://localhost:5081/api/v1/clinics"
    try {
        $response = Invoke-WebRequest -Uri $backendUrl -UseBasicParsing -TimeoutSec 10
        Write-Host "   ✅ Backend responde correctamente en: $backendUrl" -ForegroundColor Green
        Write-Host "   📦 Veterinarios disponibles: $($response.Content.Count)" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Backend no responde: $_" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ Error durante la corrección: $_" -ForegroundColor Red
}

Write-Host "`n" + "=".PadRight(80, '=')
Write-Host "✅ CORRECCIÓN COMPLETADA"
Write-Host "=".PadRight(80, '=') + "`n"
