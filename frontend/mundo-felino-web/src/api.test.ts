// Mock functions for testing without backend
async function apiGetClinics(_municipality?: string, _emergencyOnly?: boolean) {
  // Datos simulados de veterinarios (6 clínicas)
  return [
    {
      id: "veterinaria-puerto-madrid",
      name: "Veterinaria Puerto Madrid",
      address: "Puerto Madrid, Caracas",
      municipality: "Puerto Madrid",
      phone: "+58 424-123-4567",
      whatsapp: "https://wa.me/584241234567",
      emergencyAvailable: true,
      lastVerifiedAt: new Date().toISOString(),
    },
    {
      id: "veterinaria-las-aduanas",
      name: "Veterinaria Las Aduanas",
      address: "Las Aduanas, Caracas",
      municipality: "Las Aduanas",
      phone: "+58 412-987-6543",
      whatsapp: "https://wa.me/584129876543",
      emergencyAvailable: false,
      lastVerifiedAt: new Date().toISOString(),
    },
    {
      id: "veterinaria-caputarense",
      name: "Veterinaria Caputarense",
      address: "Caputá, Caracas",
      municipality: "Caputá",
      phone: "+58 281-555-1234",
      whatsapp: "https://wa.me/582815551234",
      emergencyAvailable: true,
      lastVerifiedAt: new Date().toISOString(),
    },
    {
      id: "veterinaria-rio-nuevo",
      name: "Veterinaria Río Nuevo",
      address: "Río Nuevo, Caracas",
      municipality: "Río Nuevo",
      phone: "+58 414-876-5432",
      whatsapp: "https://wa.me/584148765432",
      emergencyAvailable: false,
      lastVerifiedAt: new Date().toISOString(),
    },
    {
      id: "veterinaria-chacao",
      name: "Veterinaria El Chacao",
      address: "El Chacao, Caracas",
      municipality: "El Chacao",
      phone: "+58 416-345-6789",
      whatsapp: "https://wa.me/584163456789",
      emergencyAvailable: true,
      lastVerifiedAt: new Date().toISOString(),
    },
    {
      id: "veterinaria-porlamar",
      name: "Veterinaria Porlamar",
      address: "Porlamar, Isla de Margarita",
      municipality: "Porlamar",
      phone: "+58 243-111-2222",
      whatsapp: "https://wa.me/582431112222",
      emergencyAvailable: false,
      lastVerifiedAt: new Date().toISOString(),
    },
  ];
}

async function apiSendChat(question = "" as string, _history = [] as any) {
  // Respuestas simuladas del chat IA
  const normalized = question.toLowerCase();
  
  // Palabras clave de emergencia médica
  const EMERGENCY_KEYWORDS = [
    "no puede respirar", "dificultad para respirar", "convulsiones",
    "no puede orinar", "sangrado abundante", "se desmayó", "veneno"
  ];

  if (EMERGENCY_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      answer: "Lo descrito puede ser una emergencia veterinaria inmediata. Contacta o acude ahora mismo a una clínica veterinaria con guardia de urgencias.",
      urgency: "urgent",
      sources: [],
    };
  }

  // Respuestas por tema
  if (normalized.includes("comida") || normalized.includes("alimento") || normalized.includes("toxico")) {
    return {
      answer: "Los gatos son carnívoros estrictos y no deben consumir cebolla, ajo, chocolate, uvas, pasas o cafeína. Su dieta debe basarse en alimento formulado para felinos combinado con alimento húmedo.",
      urgency: "general",
      sources: [{ title: "Alimentación segura para gatos" }],
    };
  }

  if (normalized.includes("agua") || normalized.includes("beber")) {
    return {
      answer: "Los gatos suelen tener poca sed. Coloca varias fuentes de agua en movimiento, cambia el agua a diario y ofrece alimento húmedo.",
      urgency: "general",
      sources: [{ title: "Hidratación felina" }],
    };
  }

  if (normalized.includes("dolor") || normalized.includes("enfermo") || normalized.includes("síntoma")) {
    return {
      answer: "Los gatos enmascaran el malestar. Señales de alerta incluyen aislarse, dejar de saltar a sus sitios habituales o evitar que les toquen.",
      urgency: "general",
      sources: [{ title: "Señales de dolor felino" }],
    };
  }

  // Respuesta general
  return {
    answer: "Recuerda que cada felino tiene sus propios tiempos. Para bienestar ideal: mantén enriquecimiento vertical con rascadores, juega diariamente y haz revisiones veterinarias periódicas.",
    urgency: "general",
    sources: [{ title: "Cuidados básicos del gato" }],
  };
}

// Variables de entorno para tests (siempre undefined o falsas en tests)
export const API = undefined;
export const SUPABASE_URL = undefined;
export const SUPABASE_ANON_KEY = undefined;
export const GEMINI_API_KEY = undefined;
