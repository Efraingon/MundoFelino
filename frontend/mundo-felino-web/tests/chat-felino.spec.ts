import { test, expect, type Page } from "@playwright/test";

const ARTICLES = [
  { id: "1", title: "Alimentación segura", slug: "alimentacion-segura", summary: "Qué sí y qué no debe comer tu gato.", category: "Salud" },
  { id: "2", title: "Señales de alerta", slug: "senales-de-alerta", summary: "Cuándo acudir a un veterinario.", category: "Salud" },
  { id: "3", title: "Adaptación a casa", slug: "adaptacion-a-casa", summary: "Primeras semanas en un hogar nuevo.", category: "Comportamiento" },
];

type ChatMock = { answer?: string; urgency?: "general" | "urgent"; delay?: number };

async function mockApi(page: Page, chat: ChatMock = {}) {
  await page.route("**/api/v1/**", async route => {
    const url = route.request().url();
    if (url.includes("/ai/chat")) {
      if (chat.delay) await new Promise(resolve => setTimeout(resolve, chat.delay));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          answer: chat.answer ?? "Evita cebolla, ajo, chocolate y uvas. Ante cualquier duda, consulta con su veterinario.",
          urgency: chat.urgency ?? "general",
          sources: [{ title: "Alimentación segura", slug: "alimentacion-segura", category: "Salud" }],
          provider: "Ollama",
          model: "qwen2.5:3b",
        }),
      });
      return;
    }
    if (url.includes("/articles")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ARTICLES) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
}

test("la sección de consulta responde y cita la biblioteca", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Hablemos de tu gato/ })).toBeVisible();

  await page.locator("#consulta-question").fill("¿Qué alimentos son tóxicos para mi gato?");
  await page.locator("#consulta-question").press("Enter");

  const panel = page.locator("#consulta");
  await expect(panel.getByText("Evita cebolla, ajo, chocolate y uvas.")).toBeVisible();
  await expect(panel.getByText("Fuentes consultadas")).toBeVisible();
  await expect(panel.getByRole("button", { name: /Alimentación segura/ })).toBeVisible();
});

test("el gatico abre el chat flotante y comparte la conversación", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  const launcher = page.getByRole("button", { name: "Abrir el chat de consulta felina con Michi" });
  await expect(launcher).toBeVisible();

  const avatarLoaded = await page.locator(".chat-launcher-photo img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
  expect(avatarLoaded).toBe(true);

  await launcher.click();
  const dock = page.getByRole("dialog", { name: "Chat de consulta felina con Michi" });
  await expect(dock).toBeVisible();
  await expect(dock.getByText("Michi", { exact: true })).toBeVisible();

  await expect(page.locator("#michi-question")).toBeFocused();
  await page.locator("#michi-question").fill("¿Mi gato puede comer aguacate?");
  await page.locator("#michi-question").press("Enter");
  await expect(dock.getByText("Evita cebolla, ajo, chocolate y uvas.")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dock).toBeHidden();
  await expect(launcher).toBeFocused();

  await page.locator("#consulta").scrollIntoViewIfNeeded();
  await expect(launcher).toBeHidden();
  await expect(page.locator("#consulta").getByText("¿Mi gato puede comer aguacate?")).toBeVisible();
});

test("la respuesta indica el modelo de IA que la generó", async ({ page }) => {
  await mockApi(page);
  await page.goto("/#consulta");

  await page.locator("#consulta-question").fill("¿Qué alimentos son tóxicos para mi gato?");
  await page.locator("#consulta-question").press("Enter");

  const panel = page.locator("#consulta");
  await expect(panel.getByText("Ollama · qwen2.5:3b")).toBeVisible();
});

test("si el backend de IA falla, la consulta responde con la guía local", async ({ page }) => {
  await page.route("**/api/v1/**", async route => {
    const url = route.request().url();
    if (url.includes("/ai/chat")) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "El asistente no está disponible temporalmente." }),
      });
      return;
    }
    if (url.includes("/articles")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ARTICLES) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.goto("/#consulta");
  await page.locator("#consulta-question").fill("¿Cómo logro que mi gato beba más agua?");
  await page.locator("#consulta-question").press("Enter");

  const lastAnswer = page.locator("#consulta .assistant-message").last();
  await expect(lastAnswer).not.toBeEmpty();
  await expect(lastAnswer).not.toContainText("El asistente respondió sin contenido");
  await expect(page.locator("#consulta .chat-model")).toBeVisible();
});

test("una urgencia muestra el aviso y lleva a los veterinarios", async ({ page }) => {
  await mockApi(page, { urgency: "urgent", answer: "Acude ahora a una clínica veterinaria." });
  await page.goto("/");

  await page.getByRole("button", { name: "Abrir el chat de consulta felina con Michi" }).click();
  const dock = page.getByRole("dialog", { name: "Chat de consulta felina con Michi" });
  await page.locator("#michi-question").fill("Mi gato no puede respirar");
  await page.locator("#michi-question").press("Enter");

  await expect(dock.getByText("Atención inmediata")).toBeVisible();
  await dock.getByRole("button", { name: /Ver centros veterinarios/ }).click();
  await expect(page.getByRole("heading", { name: /Cuando lo necesitan/ })).toBeInViewport();
});
