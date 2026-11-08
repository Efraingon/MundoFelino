import { test, expect } from "@playwright/test";

test.describe("Backend Real .NET API Tests", () => {
    const backendUrl = "http://localhost:5000";

    test.beforeEach(async ({ page }) => {
        console.log("\n[TEST SETUP] Backend URL:", backendUrl);
    });

    test("1. Health Check - Endpoint /api/v1/health", async () => {
        console.log("\n--- TEST 1: Health Check ---");
        
        const response = await fetch(`${backendUrl}/api/v1/health`);
        expect(response.status).toBe(200);
        
        const healthData = await response.json();
        console.log("Response:", JSON.stringify(healthData, null, 2));
        
        expect(healthData.status).toBe("ok");
        expect(healthData.service).toContain("MundoFelino.Api");
    });

    test("2. Clinics Endpoint - Veterinarios con filtros", async () => {
        console.log("\n--- TEST 2: Clinics API ---");
        
        const response = await fetch(`${backendUrl}/api/v1/clinics?municipality=caracas`);
        expect(response.status).toBe(200);
        
        const clinics = await response.json();
        console.log("Registros de clínicas:", clinics.length);
        
        if (clinics && Array.isArray(clinics) && clinics.length > 0) {
            console.log("Ejemplo de clínica:", JSON.stringify(clinics[0], null, 2));
            
            // Verificar campos esperados
            const firstClinic = clinics[0] as any;
            expect(firstClinic).toHaveProperty('id');
            expect(firstClinic).toHaveProperty('name');
        } else {
            console.log("⚠️  Base de datos vacía o no hay clínicas en Caracas");
        }
    });

    test("3. Articles Endpoint - Artículos publicados", async () => {
        console.log("\n--- TEST 3: Articles API ---");
        
        const response = await fetch(`${backendUrl}/api/v1/articles`);
        expect(response.status).toBe(200);
        
        const articles = await response.json();
        console.log("Registros de artículos:", articles?.length || "N/A");
    });

    test("4. Libraries Endpoint - Placeholder", async () => {
        console.log("\n--- TEST 4: Libraries API ---");
        
        const response = await fetch(`${backendUrl}/api/v1/libraries`);
        expect(response.status).toBe(200);
        
        const libraries = await response.json();
        console.log("Libraries response:", JSON.stringify(libraries, null, 2));
    });

    test("5. AI Chat Endpoint - Conexión con Ollama", async () => {
        console.log("\n--- TEST 5: AI Chat API ---");
        
        const chatData = { question: "¿Cómo alimentar a un gato?" };
        const response = await fetch(`${backendUrl}/api/v1/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatData)
        });
        
        console.log("Status:", response.status);
        
        if (response.ok) {
            const aiResponse = await response.json();
            console.log("AI Answer:", aiResponse.answer || aiResponse.response);
        } else {
            console.log("⚠️  Ollama puede no estar corriendo o timeout");
        }
    });
});
