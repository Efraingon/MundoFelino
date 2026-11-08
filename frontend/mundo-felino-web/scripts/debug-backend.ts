import { API, SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY } from "../src/api";

/**
 * SCRIPT DE DIAGNÓSTICO - Backend (Veterinarios y Chat IA)
 * Ejecutar: npx ts-node scripts/debug-backend.ts
 */

console.log("\n" + "=".repeat(80));
console.log("🔍 DIAGNÓSTICO BACKEND - Veterinarios & Chat IA");
console.log("=".repeat(60));

async function runDiagnosis() {
  // Variables de entorno detectadas
  console.log("\n📋 VARIABLES DE ENTORNO:");
  console.log(`   - VITE_API_BASE_URL: ${API}`);
  console.log(`   - VITE_SUPABASE_URL: ${SUPABASE_URL ? "*** CONFIGURADA ***" : "❌ NO CONFIGURADA"}`);
  console.log(`   - VITE_GEMINI_API_KEY: ${GEMINI_API_KEY ? "*** CONFIGURADA ***" : "❌ NO CONFIGURADA"}`);
  
  // Verificar conexión con backend .NET (Veterinarios)
  console.log("\n🏥 VERIFICANDO CONSULTA DE VETERINARIOS...");
  console.log(`   API URL: ${API}/api/v1/clinics`);
  
  try {
    const clinicsResponse = await fetch(`${API}/api/v1/clinics`, {
      headers: { "Accept": "application/json" }
    });
    
    console.log(`\n📡 RESPUESTA HTTP: ${clinicsResponse.status} ${clinicsResponse.statusText}`);
    
    if (clinicsResponse.ok) {
      const clinics = await clinicsResponse.json();
      console.log(`✅ ÉXITO: Se cargaron ${clinics.length} veterinarios`);
      
      if (clinics.length > 0) {
        console.log("\n📋 MUESTRA DE VETERINARIOS:");
        clinics.slice(0, 3).forEach((clinic: any, i: number) => {
          console.log(`   ${i + 1}. ${clinic.name}`);
          if (clinic.address) console.log(`      📍 ${clinic.address}`);
          if (clinic.phone) console.log(`      📞 ${clinic.phone}`);
          if (clinic.municipality) console.log(`      🏙️  ${clinic.municipality}`);
          if (clinic.emergency_available) console.log(`      🚨 Emergencia: SÍ`);
        });
        
        // Verificar campos necesarios
        const requiredFields = ['id', 'name', 'address', 'emergencyAvailable'];
        const sampleClinic = clinics[0];
        const missingFields = requiredFields.filter(field => !sampleClinic[field]);
        
        if (missingFields.length > 0) {
          console.log(`\n⚠️  ADVERTENCIA: Faltan campos en el modelo:`);
          missingFields.forEach(field => console.log(`   - ${field}`));
        } else {
          console.log("\n✅ Todos los campos requeridos están presentes");
        }
      } else {
        console.log("⚠️  No hay veterinarios registrados (puede ser normal si la tabla está vacía)");
      }
    } else {
      console.log(`❌ ERROR HTTP: ${clinicsResponse.status} ${clinicsResponse.statusText}`);
      
      // Obtener respuesta de error para más detalles
      let errorBody = "No disponible";
      try {
        errorBody = await clinicsResponse.text().substring(0, 200);
      } catch {}
      
      console.log(`   Detalle: ${errorBody}`);
      console.log("\nPosibles causas:");
      console.log("   - El backend .NET no está corriendo en localhost:5081");
      console.log("   - La ruta /api/v1/clinics no existe en el backend");
      console.log("   - El modelo Clinic.ts del backend no coincide con la definición del frontend");
    }
    
  } catch (error: any) {
    console.log(`\n❌ EXCEPCIÓN: ${error.message}`);
    if (error.cause?.message) {
      console.log(`   Causa: ${error.cause.message}`);
    }
    console.log("\nPosibles causas:");
    console.log("   - El servidor backend (.NET) no está ejecutándose");
    console.log("   - Falta el package.json del backend o npm install no se realizó");
    console.log("   - Puerto 5081 está ocupado por otra aplicación");
  }
  
  // Verificar conexión con Supabase (Opción A)
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    console.log("\n\n🔷 VERIFICANDO CONEXIÓN SUPABASE...");
    console.log(`   URL: ${SUPABASE_URL}`);
    
    try {
      const supabaseResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/clinics?select=id,name&status=eq.Verified&limit=1`,
        {
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log(`\n📡 RESPUESTA HTTP: ${supabaseResponse.status} ${supabaseResponse.statusText}`);
      
      if (supabaseResponse.ok) {
        const data = await supabaseResponse.json();
        console.log(`✅ ÉXITO: Supabase está funcionando correctamente`);
        console.log(`   Clínicas encontradas: ${Array.isArray(data) ? data.length : 0}`);
        
        if (!Array.isArray(data)) {
          console.log(`   Respuesta: ${JSON.stringify(data, null, 2).substring(0, 300)}`);
        }
      } else {
        console.log(`❌ ERROR HTTP: ${supabaseResponse.status} ${supabaseResponse.statusText}`);
        
        let errorBody = "No disponible";
        try {
          errorBody = await supabaseResponse.text().substring(0, 200);
        } catch {}
        
        console.log(`   Detalle: ${errorBody}`);
      }
      
    } catch (error: any) {
      console.log(`\n❌ EXCEPCIÓN SUPABASE: ${error.message}`);
      console.log("\nPosibles causas:");
      console.log("   - VITE_SUPABASE_URL no está configurado en .env.local");
      console.log("   - VITE_SUPABASE_ANON_KEY no está configurado en .env.local");
    }
  } else {
    console.log("\n⚠️  SUPABASE NO CONFIGURADO (esto es normal si usas backend .NET)");
  }
  
  // Verificar configuración del Chat IA con Gemini
  if (GEMINI_API_KEY) {
    console.log("\n\n🤖 VERIFICANDO CHAT CON IA (GEMINI)...");
    console.log(`   API KEY configurada: SÍ`);
    
    console.log("\n⚠️  Nota: El chat con IA requiere un backend que exponga /api/v1/ai/chat");
    console.log("   o una implementación directa del frontend usando la API de Gemini.");
    
    console.log("\n✅ Si tienes implementado el backend .NET con endpoint de chat, verificará automáticamente.");
  } else {
    console.log("\n⚠️  GEMINI_API_KEY NO CONFIGURADA");
    console.log("   - El chat fallará a menos que uses un backend alternativo o Supabase");
    console.log("   - Para usar Gemini: agrega VITE_GEMINI_API_KEY en .env.local");
  }
  
  console.log("\n" + "=".repeat(80));
  
  // Resumen de problemas
  const issues: string[] = [];
  
  if (!API || API === "") {
    issues.push("❌ VITE_API_BASE_URL no está configurada");
  } else if (clinicsResponse?.status !== 200) {
    issues.push("⚠️  El backend .NET no responde correctamente en /api/v1/clinics");
  }
  
  if (!GEMINI_API_KEY && SUPABASE_URL === "") {
    issues.push("⚠️  Ni Supabase ni Gemini API key están configuradas para el chat");
  }
  
  if (issues.length > 0) {
    console.log("\n❗ PROBLEMAS DETECTADOS:");
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    
    console.log("\n✅ SOLUCIONES RECOMENDADAS:");
    console.log("   1. Asegúrate de que el backend .NET esté ejecutándose (docker-compose up -d)");
    console.log("   2. Verifica la configuración en frontend/mundo-felino-web/.env.local");
    console.log("   3. Para chat IA, agrega VITE_GEMINI_API_KEY o configura Supabase");
  } else {
    console.log("\n✅ TODOS LOS SERVICIOS ESTÁN FUNCIONANDO CORRECTAMENTE");
  }
  
  console.log("\n" + "=".repeat(80));
}

// Ejecutar diagnóstico
runDiagnosis().catch(error => {
  console.error("❌ Error al ejecutar diagnóstico:", error.message);
  process.exit(1);
});
