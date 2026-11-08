# Script para probar el backend .NET Live
Write-Host "=== Test de Backend .NET ===" -ForegroundColor Cyan

$backendUrl = "http://localhost:5000"
Write-Host "URL Backend: $backendUrl" -ForegroundColor Yellow

# Función para hacer curl y mostrar resultados
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Description
    )
    
    Write-Host "`n[$Description]" -ForegroundColor Green
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri "$backendUrl$path" -Method GET -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri "$backendUrl$path" -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing
        }
        
        $status = $response.StatusCode
        Write-Host "  Status: $status" -ForegroundColor $(if($status -eq "200"){"Green"}else{"Yellow"})
        
        if ($response.Content) {
            $json = $response.Content | ConvertFrom-Jackson
            $count = $json.Count ?? ("items".Count ?? "results".Count ?? 1)
            Write-Host "  Registros: $count" -ForegroundColor Cyan
            if ($count -gt 0) {
                Write-Host "  Ejemplo: $($json | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
            }
        }
        return $true
    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Tests
Test-Endpoint -Method GET -Path "/api/v1/health" -Description "1. Health Check"
Test-Endpoint -Method GET -Path "/api/v1/clinics?municipality=caracas" -Description "2. Veterinarios Caracas"
Test-Endpoint -Method GET -Path "/api/v1/articles" -Description "3. Artículos"

Write-Host "`n=== Pruebas completadas ===" -ForegroundColor Cyan