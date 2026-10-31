import type { Article, ArticleDetail, Clinic, ChatReply, ChatSource } from "./types";

export const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080";
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function getSupabaseHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY ?? "",
    Authorization: `Bearer ${SUPABASE_ANON_KEY ?? ""}`,
    "Content-Type": "application/json",
  };
}

export async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.text();
  if (!payload.trim()) return {} as T;
  try {
    return JSON.parse(payload) as T;
  } catch {
    throw new Error("La respuesta no tiene un formato JSON válido.");
  }
}

// --------------------------------------------------------------------------
// ARTÍCULOS
// --------------------------------------------------------------------------
export async function apiGetArticles(): Promise<Article[]> {
  if (isSupabaseConfigured) {
    const url = `${SUPABASE_URL}/rest/v1/articles?select=id,title,slug,summary,category,published_at&status=eq.Published&order=published_at.desc`;
    const res = await fetch(url, { headers: getSupabaseHeaders() });
    if (!res.ok) throw new Error(`Supabase error ${res.status}`);
    const data = await readJson<Array<{ id: string; title: string; slug: string; summary?: string; category: string; published_at?: string }>>(res);
    return data.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      category: item.category,
      publishedAt: item.published_at,
    }));
  }

  // Fallback a API .NET tradicional
  const res = await fetch(`${API}/api/v1/articles`);
  if (!res.ok) throw new Error();
  return readJson<Article[]>(res);
}

export async function apiGetArticleBySlug(slug: string): Promise<ArticleDetail> {
  if (isSupabaseConfigured) {
    const url = `${SUPABASE_URL}/rest/v1/articles?select=id,title,slug,summary,content,category,published_at&slug=eq.${encodeURIComponent(slug)}&status=eq.Published`;
    const res = await fetch(url, { headers: getSupabaseHeaders() });
    if (!res.ok) throw new Error(`Supabase error ${res.status}`);
    const data = await readJson<Array<{ id: string; title: string; slug: string; summary?: string; content: string; category: string; published_at?: string }>>(res);
    if (!data.length) throw new Error("Artículo no encontrado");
    const item = data[0];
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      content: item.content,
      category: item.category,
      publishedAt: item.published_at,
    };
  }

  // Fallback a API .NET tradicional
  const res = await fetch(`${API}/api/v1/articles/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error();
  return readJson<ArticleDetail>(res);
}

// --------------------------------------------------------------------------
// CLÍNICAS VETERINARIAS
// --------------------------------------------------------------------------
export async function apiGetClinics(municipality?: string, emergencyOnly?: boolean): Promise<Clinic[]> {
  if (isSupabaseConfigured) {
    const params = new URLSearchParams();
    params.set("select", "id,name,address,municipality,phone,whatsapp,latitude,longitude,emergency_available,last_verified_at");
    params.set("status", "eq.Verified");
    params.set("order", "name.asc");

    if (municipality && municipality.trim()) {
      params.set("municipality", `ilike.*${municipality.trim()}*`);
    }
    if (emergencyOnly) {
      params.set("emergency_available", "eq.true");
    }

    const url = `${SUPABASE_URL}/rest/v1/clinics?${params.toString()}`;
    const res = await fetch(url, { headers: getSupabaseHeaders() });
    if (!res.ok) throw new Error(`Supabase error ${res.status}`);
    const data = await readJson<Array<{
      id: string;
      name: string;
      address: string;
      municipality?: string;
      phone?: string;
      whatsapp?: string;
      emergency_available: boolean;
      last_verified_at?: string;
    }>>(res);

    return data.map(item => ({
      id: item.id,
      name: item.name,
      address: item.address,
      municipality: item.municipality,
      phone: item.phone,
      whatsapp: item.whatsapp,
      emergencyAvailable: item.emergency_available,
      lastVerifiedAt: item.last_verified_at,
    }));
  }

  // Fallback a API .NET tradicional
  const params = new URLSearchParams();
  if (municipality && municipality.trim()) params.set("municipality", municipality.trim());
  if (emergencyOnly) params.set("emergency", "true");
  const query = params.toString();
  const res = await fetch(`${API}/api/v1/clinics${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error();
  return readJson<Clinic[]>(res);
}

// --------------------------------------------------------------------------
// ASISTENTE CHAT / IA
// --------------------------------------------------------------------------
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
  "atropellado",
];

export async function apiSendChat(
  question: string,
  history: Array<{ role: string; content: string }> = []
): Promise<ChatReply> {
  const normalized = question.toLowerCase();

  // 1. Regla crítica de seguridad médica de urgencia (inmediata en frontend)
  if (EMERGENCY_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      answer: "Lo descrito puede ser una emergencia veterinaria inmediata. Contacta o acude ahora mismo a una clínica veterinaria con guardia de urgencias; no esperes una respuesta por el chat. No administres medicamentos humanos ni remedios caseros sin supervisión profesional.",
      urgency: "urgent",
      sources: [],
    };
  }

  // 2. Si hay backend tradicional disponible, consultar
  if (!isSupabaseConfigured || import.meta.env.VITE_API_BASE_URL) {
    try {
      const res = await fetch(`${API}/api/v1/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(Number(import.meta.env.VITE_CHAT_TIMEOUT_MS ?? 90000)),
        body: JSON.stringify({ question, history }),
      });
      return readJson<ChatReply>(res);
    } catch (err) {
      // Si el backend tradicional falla pero estamos en modo autónomo, pasar al fallback
      if (!isSupabaseConfigured) throw err;
    }
  }

  // 3. Si Gemini API está configurada directamente en Vercel
  if (GEMINI_API_KEY) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const systemInstruction = "Eres Michi, el asistente educativo de Mundo Felino en Caracas. Responde con calidez, rigor preventivo y claridad sobre cuidados de gatos. No diagnostiques ni prescribas fármacos. Recomienda siempre acudir al veterinario ante signos de alarma.";
      const contents = [
        { role: "user", parts: [{ text: `${systemInstruction}\n\nPregunta del cuidador: ${question}` }] }
      ];
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      if (res.ok) {
        const geminiData = await res.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            answer: text,
            urgency: "general",
            sources: [{ title: "Guía de Cuidados Felinos", slug: "alimentacion-segura", category: "Salud" }],
          };
        }
      }
    } catch {
      // Si Gemini da error de red, pasa al asistente de conocimiento local
    }
  }

  // 4. Asistente Educativo Integrado (Respuestas verificadas de la guía felina)
  return getKnowledgeBaseAnswer(normalized);
}

function getKnowledgeBaseAnswer(question: string): ChatReply {
  const sources: ChatSource[] = [];

  if (question.includes("comida") || question.includes("alimento") || question.includes("tóxico") || question.includes("toxico") || question.includes("comer") || question.includes("cebolla") || question.includes("chocolate") || question.includes("aguacate")) {
    sources.push({ title: "Alimentación segura: qué sí y qué evitar", slug: "alimentacion-segura", category: "Alimentación" });
    return {
      answer: "Los gatos son carnívoros estrictos y no deben consumir cebolla, ajo, chocolate, uvas, pasas, cafeína ni comida condimentada. Su dieta debe basarse en alimento formulado para felinos combinado con alimento húmedo para cuidar sus riñones.",
      urgency: "general",
      sources,
    };
  }

  if (question.includes("agua") || question.includes("beber") || question.includes("riñón") || question.includes("rinon") || question.includes("hidrat")) {
    sources.push({ title: "Agua e hidratación: cómo lograr que beba más", slug: "agua-e-hidratacion", category: "Alimentación" });
    return {
      answer: "Los gatos suelen tener poca sensación innata de sed. Para estimular que beban más en Caracas: coloca varias fuentes de agua en movimiento, cambia el agua a diario y ofrece alimento húmedo en sus raciones habituales.",
      urgency: "general",
      sources,
    };
  }

  if (question.includes("dolor") || question.includes("enfermo") || question.includes("síntoma") || question.includes("sintoma") || question.includes("apático") || question.includes("triste")) {
    sources.push({ title: "Señales de dolor que suelen pasar desapercibidas", slug: "senales-de-dolor", category: "Salud" });
    return {
      answer: "Los gatos enmascaran el malestar por instinto. Señales de alerta comunes incluyen: aislarse en lugares oscuros, dejar de saltar a sus sitios habituales, postura encorvada, dejar de asearse o evitar que le toquen ciertas áreas. Ante dudas, hazlo revisar por su veterinario.",
      urgency: "general",
      sources,
    };
  }

  if (question.includes("arenero") || question.includes("arena") || question.includes("orina") || question.includes("baño") || question.includes("bano")) {
    sources.push({ title: "El arenero: ubicación, tipo y limpieza", slug: "el-arenero-guia-practica", category: "Comportamiento" });
    return {
      answer: "La regla de oro del arenero es: número de gatos + 1 bandeja adicional. Mantenlo en un sitio tranquilo lejos de su comida y electrodomésticos ruidosos. La arena aglomerante sin perfume suele ser la preferida.",
      urgency: "general",
      sources,
    };
  }

  if (question.includes("vacuna") || question.includes("desparasit") || question.includes("pulga")) {
    sources.push({ title: "Vacunación y desparasitación básica", slug: "vacunacion-y-desparasitacion", category: "Salud" });
    return {
      answer: "El esquema esencial incluye la Triple Felina (panleucopenia, calicivirus, rinotraqueítis) y la vacuna contra la Rabia, con desparasitación regular incluso si el gato no sale de casa, ya que los parásitos pueden entrar en nuestros zapatos.",
      urgency: "general",
      sources,
    };
  }

  // Respuesta general educativa
  sources.push({ title: "Primeras semanas en un hogar nuevo", slug: "primeras-semanas-en-casa", category: "Comportamiento" });
  return {
    answer: "Recuerda que cada felino tiene sus propios tiempos y rutinas. Para brindarle el mejor bienestar: mantén un enriquecimiento vertical con rascadores y alturas, rutinas de juego diario de 10-15 minutos y revisiones veterinarias periódicas.",
    urgency: "general",
    sources,
  };
}
