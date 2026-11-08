#!/usr/bin/env python3
"""
Script de diagnóstico para verificar conexión Backend & Base de Datos
Uso: python verify-backend.py
"""

import socket
import json
import sys

def check_port(host, port, timeout=5):
    """Verificar si un puerto está abierto"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return True if result == 0 else False
    except:
        return False

def print_section(title):
    """Imprimir sección"""
    print("\n" + "=" * 80)
    print(title.center(80))
    print("=" * 80)

def main():
    print_section("🔍 DIAGNÓSTICO BACKEND - Mundo Felino MVP")
    
    # Verificar backend .NET
    print("\n1. VERIFICANDO BACKEND .NET...")
    backend_running = check_port("localhost", 5081)
    
    if backend_running:
        print("\n   ✅ Backend .NET está corriendo en localhost:5081")
        
        # Verificar puerto de la base de datos
        db_running = check_port("localhost", 5432)
        if db_running:
            print("\n   ✅ PostgreSQL está corriendo en localhost:5432")
        else:
            print("\n   ⚠️  PostgreSQL NO está corriendo (puede que no sea necesario)")
        
        # Verificar docker
        import subprocess
        try:
            result = subprocess.run(['docker', 'ps'], capture_output=True, text=True)
            if 'mundofelino' in result.stdout.lower() or result.returncode == 0:
                print("\n   ✅ Docker está activo")
            else:
                print("\n   ⚠️  Docker podría no estar ejecutando los contenedores")
        except FileNotFoundError:
            print("\n   ⚠️  Docker no encontrado (verifica instalación)")
    else:
        print("\n   ❌ Backend .NET NO está corriendo en localhost:5081")
        print("\n   🔧 PARA INICIAR EL BACKEND:")
        print("      docker-compose up -d --build")
        print("\n      O desde la carpeta backend/MundoFelino.Api:")
        print("      dotnet run")
    
    # Verificar configuración del frontend
    import os
    env_file = "C:/Negocio/MicroappFelina/MundoFelino_MVP/MundoFelino/frontend/mundo-felino-web/.env"
    
    if os.path.exists(env_file):
        print(f"\n2. CONFIGURACIÓN FRONTEND:")
        with open(env_file, 'r') as f:
            content = f.read()
            if "VITE_API_BASE_URL=http://localhost:5081" in content:
                print("   ✅ VITE_API_BASE_URL está configurada correctamente")
            else:
                print("   ⚠️  VITE_API_BASE_URL podría necesitar configuración")
    else:
        print(f"\n2. CONFIGURACIÓN FRONTEND:")
        print(f"   ❌ {env_file} no encontrado")
    
    # Resumen
    print_section("📊 RESULTADOS DEL DIAGNÓSTICO")
    
    if backend_running:
        print("\n   ✅ BACKEND FUNCIONANDO CORRECTAMENTE")
        print("\n   🎯 Siguiente paso: Ejecutar npx playwright test para verificar:")
        print("      - Consulta de veterinarios")
        print("      - Chat con IA (si hay API key)")
    else:
        print("\n   ❌ BACKEND NO FUNCIONA")
        print("\n   🔧 Solución:")
        print("      1. Inicia Docker: docker-compose up -d --build")
        print("      2. O inicia backend manualmente:")
        print("         cd C:/Negocio/MicroappFelina/MundoFelino_MVP/MundoFelino/backend/MundoFelino.Api")
        print("         dotnet run")
    
    print_section("=" * 80)

if __name__ == "__main__":
    main()
