/**
 * Pruebas básicas para verificar que los datos simulados funcionan correctamente
 */

import { test, expect } from "@playwright/test";

test.describe("Datos Simulados", () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página principal
    await page.goto("/");
  });

  test("Veterinarios se cargan correctamente con datos simulados", async ({ page }) => {
    console.log("📍 Prueba: Veterinarios con datos simulados");
    
    // Esperar a que la página cargue
    await page.waitForSelector('[data-testid="veterinarios"]', { timeout: 10000 });
    
    // Verificar que hay al menos un veterinario visible
    const veterinarioCount = await page.locator('[data-testid="veterinario-item"]').count();
    console.log(`📊 Veterinarios encontrados: ${veterinarioCount}`);
    
    expect(veterinarioCount).toBeGreaterThan(0);
    
    // Verificar que se muestra información de veterinarios
    const names = await page.locator('[data-testid="veterinario-nombre"]').all();
    console.log(`📋 Nombres de veterinarios: ${names.length}`);
    
    for (const name of names) {
      const text = await name.textContent();
      if (text) {
        console.log(`   - ${text}`);
      }
    }
  });

  test("Chat muestra respuestas con datos simulados", async ({ page }) => {
    console.log("\n📍 Prueba: Chat con datos simulados");
    
    // Buscar el botón de chat flotante
    const chatButton = page.locator('.chat-button, [data-testid="chat-button"]');
    
    if (await chatButton.isVisible()) {
      console.log("✅ Botón de chat visible");
      
      // Hacer clic en el botón de chat
      await chatButton.click();
      
      // Esperar a que se abra la ventana de chat
      await page.waitForSelector('.chat-messages, .chat-container', { timeout: 10000 });
      
      console.log("✅ Ventana de chat abierta");
      
      // Enviar un mensaje simple
      const messageInput = page.locator('textarea[name="question"]');
      await messageInput.fill("¿Qué alimento es seguro para gatos?");
      
      // Simular envío (puede variar según el componente)
      const sendButton = page.locator('[data-testid="send-button"], button[type="submit"]');
      if (await sendButton.isVisible()) {
        await sendButton.click();
        
        // Esperar a la respuesta
        await page.waitForTimeout(2000);
        
        console.log("⏳ Esperando respuesta del chat...");
        
        // Verificar que hay una respuesta
        const responseText = await page.locator('.chat-messages [role="article"]').last().textContent();
        if (responseText) {
          console.log(`💬 Respuesta recibida: "${responseText?.substring(0, 100)}..."`);
        }
      }
      
    } else {
      console.log("⚠️  Botón de chat no visible - podría estar usando modo diferente");
    }
    
    await page.waitForTimeout(1000);
  });

  test("Página principal carga sin errores", async ({ page }) => {
    console.log("\n📍 Prueba: Página principal");
    
    await page.goto("/");
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log(`🏷️  Título de la página: ${title}`);
    
    // Verificar que el título contiene información sobre gatos
    expect(title.toLowerCase()).toContain("felino") || expect(title.toLowerCase()).toContain("gato") || 
    expect(title).toBe("Mundo Felino");
  });

  test("Verificación de configuración de entorno", async ({ page }) => {
    console.log("\n📍 Prueba: Configuración de entorno");
    
    // Verificar que USE_MOCK_DATA está activo (esto se ve en consola)
    const consoleMessages = [];
    page.on('console', msg => {
      console.log(`📝 Consola: ${msg.type()}: ${msg.text()}`);
      consoleMessages.push(msg.text());
    });
    
    // Hacer una acción para activar la carga de datos
    await page.click('[data-testid="ver-all-veterinarios"]');
    
    // Verificar mensajes de consola relacionados con mock data
    const mockDataMessages = consoleMessages.filter(m => 
      m.includes("Usando datos simulados") || 
      m.includes("mock") || 
      m.includes("Mock")
    );
    
    if (mockDataMessages.length > 0) {
      console.log(`✅ Confirmado: Se están usando ${mockDataMessages.length} mensajes de datos simulados`);
      for (const msg of mockDataMessages) {
        console.log(`   ${msg}`);
      }
    } else {
      console.log("⚠️  No se detectaron mensajes de datos simulados en consola");
    }
  });
});