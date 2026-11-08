import { test, expect } from "@playwright/test";

/**
 * SCRIPT DE DEBUG - Verifica conexión con Base de Datos y Chat IA
 * Ejecutar: npx playwright test --project=desktop tests/debug-api.spec.ts
 */

test.describe("Debug API - Veterinarios y Chat", () => {
  
  /**
   * Test 1: Diagnóstico de veterinarios (Clínica)
   * Verifica si la conexión con Supabase o API .NET funciona correctamente
   */
  test("diagnóstico veterinarios - verifica apiGetClinics", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("🔍 DIAGNÓSTICO: CONSULTA VETERINARIOS");
    console.log("=".repeat(60));
    
    // Rastrear todas las peticiones API
    let apiCalls: Array<{ endpoint: string; params?: string }> = [];
    
    page.on("request", request => {
      const url = request.url();
      if (url.includes("/api/v1/clinics")) {
        console.log(`\n📡 PETICIÓN API: ${request.method()} ${url}`);
        
        // Extraer query parameters
        try {
          const params = new URL(url).searchParams.toString();
          console.log(`   Parámetros: ${params || "Sin filtros"}`);
        } catch (e) {
          console.log("   Parámetros: No disponible");
        }
      }
    });

    page.on("response", response => {
      const url = response.url();
      if (url.includes("/api/v1/clinics")) {
        response.json().then(data => {
          console.log(`   📦 RESPUESTA: ${data.length} veterinarios encontrados`);
          if (data.length > 0) {
            console.log(`   Ejemplo: ${JSON.stringify(data[0], null, 2).substring(0, 200)}...`);
          }
        }).catch(() => {});
      }
    });

    // Navegar a la página y verificar veterinarios
    await page.goto("/");
    
    // Esperar a que cargue la sección de veterinarios
    const vetsSection = page.locator("#veterinarios");
    const vetsHeading = page.getByRole("heading", { name: /centro\/clínica veterinaria/i });
    
    console.log("\n🔍 Verificando sección 'Veterinarios'...");
    await expect(vetsSection).toBeVisible();
    await expect(vetsHeading).toBeVisible();
    
    // Esperar a que cargue la lista (puede tardar si hay problemas de conexión)
    const clinicCards = page.locator(".clinic");
    
    console.log(`\n📊 RESULTADO:`);
    console.log(`   - Tarjetas encontradas: ${clinicCards.length}`);
    console.log(`   - Estado de la página: ${vetsSection.isVisible() ? "Visible" : "Oculto"}`);
    
    if (clinicCards.count() > 0) {
      const clinics = await clinicCards.allTextContents();
      console.log(`\n✅ VETERINARIOS CARGADOS:`);
      clinics.forEach((text, i) => {
        if (i < 3) console.log(`   ${i + 1}. ${text.substring(0, 80)}...`);
      });
    } else {
      console.log("\n⚠️  ADVERTENCIA: No se cargaron veterinarios");
      console.log("Posibles causas:");
      console.log("   - Supabase no está configurado en .env.local");
      console.log("   - API .NET backend no está corriendo en localhost:5081");
      console.log("   - Error de conexión con la base de datos");
    }

    console.log("\n" + "=".repeat(60));
  });

  /**
   * Test 2: Diagnóstico del Chat con IA (Gemini/LLM)
   * Verifica si el chat está conectado correctamente al modelo de IA
   */
  test("diagnóstico chat - verifica apiSendChat", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("🔍 DIAGNÓSTICO: CHAT CON IA (GEMINI/LLM)");
    console.log("=".repeat(60));
    
    let chatCalls = 0;
    let lastResponse: any = null;

    page.on("request", request => {
      const url = request.url();
      if (url.includes("/ai/chat") || url.includes("/v1/ai/chat")) {
        console.log(`\n📡 PETICIÓN CHAT API: ${request.method()} ${url}`);
        
        // Leer body de la petición
        request.postDataJSON().then(body => {
          if (body && typeof body === "object") {
            console.log(`   Mensaje del usuario: "${body.messages?.[body.messages.length - 1]?.content?.substring(0, 50)}..."`);
          }
        }).catch(() => {});
        
        chatCalls++;
      }
    });

    page.on("response", response => {
      const url = response.url();
      if (url.includes("/ai/chat") || url.includes("/v1/ai/chat")) {
        response.json().then(data => {
          lastResponse = data;
          console.log(`\n📦 RESPUESTA CHAT:`);
          console.log(`   - Estado: ${response.status()}`);
          console.log(`   - Respuesta: "${(data.answer || "").substring(0, 100)}..."`);
          
          if (data.error) {
            console.log(`   ⚠️  ERROR: ${data.error}`);
          }
          
          if (data.urgency === "urgent") {
            console.log(`   🚨 PRIORIDAD: ${data.urgency}`);
          }
        }).catch(err => {
          console.log(`\n❌ ERROR DE RESPUESTA: ${err.message}`);
        });
      }
    });

    // Abrir el chat flotante
    const launcher = page.getByRole("button", { name: /Abrir.*chat/i });
    if (launcher.isVisible()) {
      console.log("\n🖱️  Abriendo chat flotante...");
      await launcher.click();
      
      // Esperar a que cargue el panel de chat
      const chatPanel = page.getByRole("dialog", { name: /Chat.*consulta felina/i });
      await expect(chatPanel).toBeVisible();
      
      console.log("\n📝 Enviando pregunta de prueba...");
      
      // Enviar pregunta simple
      await page.locator("#michi-question").fill("¿Mi gato puede comer atún?");
      await page.locator("#michi-question").press("Enter");
      
      // Esperar respuesta (con timeout)
      const maxWaitTime = 20000; // 20 segundos
      let lastLogTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (chatCalls > 0) break;
        
        // Verificar si ha pasado mucho tiempo desde la última log
        const now = Date.now();
        if (now - lastLogTime > maxWaitTime / 2) {
          console.log("\n⏱️  La petición se está demorando...");
        }
      }
      
      // Verificar si recibió respuesta
      const assistantResponse = chatPanel.locator(".assistant-message").last();
      console.log(`\n📊 RESULTADO CHAT:`);
      console.log(`   - Peticiones de chat: ${chatCalls}`);
      console.log(`   - Respuestas recibidas: ${!!lastResponse}`);
      
      if (chatCalls > 0 && lastResponse) {
        if (lastResponse.answer) {
          console.log(`   ✅ CHAT FUNCIONA:`);
          console.log(`      "${lastResponse.answer.substring(0, 150)}..."`);
        } else if (lastResponse.error) {
          console.log(`   ❌ CHAT FALLÓ - Error: ${lastResponse.error}`);
          console.log(`\nPosibles causas:`);
          console.log(`   - API KEY de Gemini no está configurada en .env.local`);
          console.log(`   - El backend del chat no está corriendo`);
          console.log(`   - Vercel detecta la petición pero no tiene credenciales`);
        } else {
          console.log(`   ⚠️  CHAT SIN RESPUESTA (verificar logs de API)`);
        }
      } else {
        console.log(`\n❌ CHAT NO SE CONECTÓ AL MODELO DE IA`);
        console.log("\nPosibles causas:");
        console.log("   - VITE_GEMINI_API_KEY no está configurado");
        console.log("   - La API de Gemini requiere autenticación específica");
        console.log("   - El backend .NET no implementó el endpoint /api/v1/ai/chat");
      }
      
      // Cerrar chat
      await page.locator(".chat-close").click();
    } else {
      console.log("\n⚠️  Chat flotante no visible en la página");
    }

    console.log("\n" + "=".repeat(60));
    console.log("💡 RECOMENDACIONES:");
    console.log("   1. Verificar que VITE_GEMINI_API_KEY está en .env.local");
    console.log("   2. Verificar que el backend .NET esté corriendo (localhost:5081)");
    console.log("   3. Opcional: Usar Supabase para chat si tienes configurado Supabase");
    console.log("\n" + "=".repeat(60));
  });

  /**
   * Test 3: Verificar configuración del entorno
   */
  test("verificar configuración .env", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("🔍 DIAGNÓSTICO: CONFIGURACIÓN DEL ENTORNO");
    console.log("=".repeat(60));
    
    // Intentar cargar página y verificar URLs de API
    await page.goto("/");
    
    // Evaluar en el contexto de la página para obtener configuración
    const config = await page.evaluate(() => {
      return {
        VITE_API_BASE_URL: (window as any).__VITE_API_BASE_URL,
        VITE_SUPABASE_URL: (window as any).__VITE_SUPABASE_URL?.substring(0, 20),
        hasGemini: (window as any).__VITE_GEMINI_API_KEY !== undefined,
      };
    });

    console.log("\n📋 Variables de entorno detectadas:");
    console.log(`   - VITE_API_BASE_URL: ${config.VITE_API_BASE_URL || "No configurada"}`);
    console.log(`   - VITE_SUPABASE_URL: ${config.VITE_SUPABASE_URL ? "*** Configurada ***" : "No configurada"}`);
    console.log(`   - VITE_GEMINI_API_KEY: ${config.hasGemini ? "*** Configurada ***" : "No configurada"}`);

    // Verificar qué endpoints están disponibles
    await page.route("**/api/**", route => {
      const url = new URL(route.request().url());
      console.log(`\n🔌 Endpoints API disponibles:`);
      console.log(`   - ${route.request().method()} ${url.pathname}`);
      return async (f, req, response) => f(req, response);
    });

    console.log("\n✅ Verificación completada");
    console.log("=".repeat(60));
  });

});
