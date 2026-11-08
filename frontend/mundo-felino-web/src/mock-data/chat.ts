/**
 * Respuestas simuladas para el chat con IA
 * Se usan cuando USE_MOCK_DATA=true y no hay backend .NET activo
 */

export interface ChatReply {
  answer: string;
  urgency: "urgent" | "general";
  sources: Array<{ title: string; slug: string; category: string }>;
}

/**
 * Base de conocimiento para respuestas del asistente educativo
 */
const KNOWLEDGE_BASE: Record<string, ChatReply> = {
  comida: {
    answer: "Los gatos son carnívoros estrictos y no deben consumir cebolla, ajo, chocolate, uvas, pasas, cafeína ni comida condimentada. Su dieta debe basarse en alimento formulado para felinos combinado con alimento húmedo para cuidar sus riñones.",
    urgency: "general" as const,
    sources: [{ title: "Alimentación segura: qué sí y qué evitar", slug: "alimentacion-segura", category: "Alimentación" }],
  },
  agua: {
    answer: "Los gatos suelen tener poca sensación innata de sed. Para estimular que beban más en Caracas: coloca varias fuentes de agua en movimiento, cambia el agua a diario y ofrece alimento húmedo en sus raciones habituales.",
    urgency: "general" as const,
    sources: [{ title: "Agua e hidratación: cómo lograr que beba más", slug: "agua-e-hidratacion", category: "Alimentación" }],
  },
  dolor: {
    answer: "Los gatos enmascaran el malestar por instinto. Señales de alerta comunes incluyen: aislarse en lugares oscuros, dejar de saltar a sus sitios habituales, postura encorvada, dejar de asearse o evitar que le toquen ciertas áreas. Ante dudas, hazlo revisar por su veterinario.",
    urgency: "general" as const,
    sources: [{ title: "Señales de dolor que suelen pasar desapercibidas", slug: "senales-de-dolor", category: "Salud" }],
  },
  arenero: {
    answer: "La regla de oro del arenero es: número de gatos + 1 bandeja adicional. Mantenlo en un sitio tranquilo lejos de su comida y electrodomésticos ruidosos. La arena aglomerante sin perfume suele ser la preferida.",
    urgency: "general" as const,
    sources: [{ title: "El arenero: ubicación, tipo y limpieza", slug: "el-arenero-guia-practica", category: "Comportamiento" }],
  },
  vacuna: {
    answer: "El esquema esencial incluye la Triple Felina (panleucopenia, calicivirus, rinotraqueítis) y la vacuna contra la Rabia, con desparasitación regular incluso si el gato no sale de casa, ya que los parásitos pueden entrar en nuestros zapatos.",
    urgency: "general" as const,
    sources: [{ title: "Vacunación y desparasitación básica", slug: "vacunacion-y-desparasitacion", category: "Salud" }],
  },
};



/**
 * Función para obtener respuesta simulada de chat (mimicking backend)
 */
export async function getMockChatResponse(question: string): Promise<ChatReply> {
  const normalized = question.toLowerCase();
  
  // Reglas críticas de seguridad médica de urgencia
  const EMERGENCY_KEYWORDS = [
    "no puede respirar",
    "dificultad para respirar",
    "convulsiones",
    "no puede orinar",
    "intenta orinar y no",
    "sangrado abundante",
    "se desmayó",
    "se desmayo",
    "veneno",
    "intoxicación",
    "intoxicacion",
    "veneno para ratas",
    "atropellado"
  ];
  
  if (EMERGENCY_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      answer: "Lo descrito puede ser una emergencia veterinaria inmediata. Contacta o acude ahora mismo a una clínica veterinaria con guardia de urgencias; no esperes una respuesta por el chat. No administres medicamentos humanos ni remedios caseros sin supervisión profesional.",
      urgency: "urgent" as const,
      sources: [],
    };
  }

  // Intentar buscar en base de conocimiento
  for (const key in KNOWLEDGE_BASE) {
    if (normalized.includes(key)) {
      return KNOWLEDGE_BASE[key];
    }
  }

  // Respuesta general amigable
  return {
    answer: "¡Qué gran cuidador! 😺 Para cualquier otra duda sobre tu gato, consulta con su veterinario de confianza. Yo estoy aquí para recordarte que los gatos nos enseñan mucho sobre el amor y la paciencia.",
    urgency: "general" as const,
    sources: [{ title: "Mundo Felino - Guía de Cuidados", slug: "guia-general", category: "General" }],
  };
}
