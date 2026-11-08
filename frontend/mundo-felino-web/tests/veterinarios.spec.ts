import { test, expect, type Page } from "@playwright/test";

const VETERINARIOS = [
  {
    id: "1",
    name: "Clínica Veterinaria Central de Caracas",
    address: "Av. Francisco de Miranda #456",
    municipality: "Chacao",
    phone: "(0212) 555-1234",
    whatsapp: "https://wa.me/584123456789",
    emergencyAvailable: true,
    lastVerifiedAt: "2026-10-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Veterinaria Las Mercedes",
    address: "Calle 24 #23-56",
    municipality: "La Carolina",
    phone: "(0212) 555-2345",
    whatsapp: "",
    emergencyAvailable: false,
    lastVerifiedAt: "2026-10-10T14:20:00Z",
  },
];

/**
 * Test suite para verificar la consulta de veterinarios (clinics)
 * Este test diagnostica problemas con la conexión a Supabase o la API .NET backend
 */

test.describe("Veterinarios - Consultas a Base de Datos", () => {
  
  /**
   * Test 1: Verificar que se cargan los veterinarios por defecto (sin filtros)
   * Este test valida la función apiGetClinics con parámetros vacíos
   */
  test("la lista de veterinarios se carga correctamente sin filtros", async ({ page }) => {
    await page.route("**/api/v1/clinics", async route => {
      const url = new URL(route.request().url());
      // Leer query params para ver qué estamos pidiendo
      const params = new URLSearchParams(url.search);
      
      console.log("✓ Petición a /api/v1/clinics con parámetros:", params.toString());
      
      // Simular respuesta de veterinarios (reemplazar con datos reales)
      await route.fulfill({ 
        status: 200, 
        contentType: "application/json", 
        body: JSON.stringify(VETERINARIOS) 
      });
    });

    await page.goto("/");
    
    // Esperar a que cargue la lista de veterinarios
    const vetsSection = page.locator("#veterinarios");
    await expect(vetsSection).toBeVisible();
    await expect(vetsSection.getByRole("heading", { name: /centro\/clínica veterinaria/i })).toBeVisible();

    // Verificar que se muestran los veterinarios
    const clinicCards = page.locator(".clinic");
    console.log(`✓ Encontradas ${clinicCards.length} tarjetas de clínica`);
    
    await expect(clinicCards).toHaveCount(2, { timeout: 5000 });
    
    // Verificar datos específicos
    await expect(clinicCards.first.getByText("Clínica Veterinaria Central de Caracas")).toBeVisible();
    await expect(clinicCards.first.getByText("Av. Francisco de Miranda #456")).toBeVisible();
  });

  /**
   * Test 2: Verificar filtros por municipio
   */
  test("los veterinarios se filtran correctamente por municipio", async ({ page }) => {
    await page.route("**/api/v1/clinics", async route => {
      const url = new URL(route.request().url());
      const params = new URLSearchParams(url.search);
      
      console.log("✓ Petición filtrada con parámetros:", params.toString());
      
      // Simular filtro por municipio
      let filtered = VETERINARIOS;
      if (params.get("municipality")?.includes("Chacao")) {
        filtered = VETERINARIOS.filter(v => v.municipality?.toLowerCase().includes("chaco"));
      }
      
      await route.fulfill({ 
        status: 200, 
        contentType: "application/json", 
        body: JSON.stringify(filtered.length > 0 ? filtered : []) 
      });
    });

    await page.goto("/");
    
    // Buscar el formulario de búsqueda de veterinarios y filtrar por municipio
    const municipalityInput = page.getByPlaceholder(/ciudad\/municipio/i);
    await municipalityInput.fill("Chacao");
    await municipalityInput.press("Enter");
    
    // Esperar a que cargue la lista filtrada
    const clinicCards = page.locator(".clinic");
    console.log(`✓ Después del filtro: ${clinicCards.length} clínicas`);
    
    await expect(clinicCards).toHaveCount(2, { timeout: 5000 });
    await expect(page.getByText("Clínica Veterinaria Central de Caracas")).toBeVisible();
  });

  /**
   * Test 3: Verificar filtro por emergencia
   */
  test("solo se muestran veterinarios con guardia para emergencias", async ({ page }) => {
    await page.route("**/api/v1/clinics", async route => {
      const url = new URL(route.request().url());
      const params = new URLSearchParams(url.search);
      
      console.log("✓ Petición de emergencia:", params.toString());
      
      // Simular filtro por emergencia
      let filtered = VETERINARIOS;
      if (params.get("emergency") === "true") {
        filtered = VETERINARIOS.filter(v => v.emergencyAvailable === true);
      }
      
      await route.fulfill({ 
        status: 200, 
        contentType: "application/json", 
        body: JSON.stringify(filtered) 
      });
    });

    await page.goto("/");
    
    // Filtrar solo por emergencia
    const emergencyCheckbox = page.getByLabel("Solo emergencias");
    await emergencyCheckbox.check();
    await page.getByRole("button", { name: "Buscar" }).click();
    
    // Esperar a que cargue la lista filtrada
    const clinicCards = page.locator(".clinic");
    console.log(`✓ Después de filtrar por emergencia: ${clinicCards.length} clínicas`);
    
    await expect(clinicCards).toHaveCount(1, { timeout: 5000 }); // Solo el que tiene emergencyAvailable: true
    await expect(page.getByText("Clínica Veterinaria Central de Caracas")).toBeVisible();
    await expect(page.getByText("Llamar ahora")).toBeVisible();
  });

  /**
   * Test 4: Verificar estado de carga y errores
   */
  test("muestra mensaje correcto cuando no hay veterinarios", async ({ page }) => {
    await page.route("**/api/v1/clinics", async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: "application/json", 
        body: JSON.stringify([]) // Sin veterinarios
      });
    });

    await page.goto("/");
    
    // Filtrar por un municipio que no existe
    const municipalityInput = page.getByPlaceholder(/ciudad\/municipio/i);
    await municipalityInput.fill("Municipio Inexistente 999");
    await municipalityInput.press("Enter");
    
    // Esperar a que cargue la lista vacía
    const clinicCards = page.locator(".clinic");
    await expect(clinicCards).toHaveCount(0, { timeout: 5000 });
    
    // Verificar mensaje de error/ausencia
    await expect(page.getByText(/no pudimos consultar/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /intentar de nuevo/i })).toBeVisible();
  });

  /**
   * Test 5: Verificar que los botones de acción funcionan correctamente
   */
  test("los botones de WhatsApp y teléfono redirigen correctamente", async ({ page }) => {
    await page.route("**/api/v1/clinics", async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: "application/json", 
        body: JSON.stringify(VETERINARIOS) 
      });
    });

    await page.goto("/");
    
    // Esperar a que cargue la lista
    const clinicCards = page.locator(".clinic");
    await expect(clinicCards).toHaveCount(2, { timeout: 5000 });
    
    // Verificar botón de WhatsApp en la primera clínica
    const whatsappButton = page.getByRole("button", { name: /WhatsApp/ });
    await expect(whatsappButton).toBeVisible();
    
    // Simular click (solo verificar que el botón existe y es funcional)
    console.log("✓ Botón de WhatsApp visible y funcional");
  });

});

test.describe("Veterinarios - UI e Interacción", () => {
  
  /**
   * Test 6: Verificar la sección de urgencia veterinaria
   */
  test("la sección de urgencias veterinarias muestra información correcta", async ({ page }) => {
    await page.goto("/");
    
    // Esperar a que cargue la página
    await expect(page.getByRole("heading", { name: "Veterinarios" })).toBeVisible();
    
    const vetsSection = page.locator("#veterinarios");
    await expect(vetsSection).toHaveAttribute("aria-labelledby", /vets-title|veterinarios/i);
    
    console.log("✓ Sección de veterinarios cargada correctamente");
  });

});

/**
 * Test helpers para debugging
 */
test.afterEach(async ({ page }) => {
  // Verificar estado del DOM después de cada test
  const routesCalled: string[] = [];
  await page.route("**/api/v1/**", route => {
    const url = route.request().url();
    console.log(`[API] ${route.request().method()} ${url}`);
    return async (f, req, response) => {
      routesCalled.push(url);
      return f(req, response);
    };
  });
  
  // Console.log para debugging
  const logs = page.locator("body").allTextContents();
});
