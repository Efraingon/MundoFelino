import { test, expect } from "@playwright/test";

test.describe("Carrusel de galería", () => {
  test("avanza solo, se puede pausar y usa glassmorphism", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");

    const carousel = page.locator(".carousel-container");
    await carousel.scrollIntoViewIfNeeded();

    const counter = page.locator(".carousel-counter b");
    await expect(counter).toHaveText("1");

    // Avance automático a los 6 segundos.
    await page.clock.fastForward(6_500);
    await expect(counter).toHaveText("2");

    // La pausa explícita detiene el avance.
    const toggle = page.getByRole("button", {
      name: "Pausar reproducción automática del carrusel",
    });
    await toggle.click();
    await expect(
      page.getByRole("button", { name: "Reanudar reproducción automática del carrusel" }),
    ).toBeVisible();
    await page.clock.fastForward(13_000);
    await expect(counter).toHaveText("2");

    // Reanudar vuelve a activar el avance.
    await page
      .getByRole("button", { name: "Reanudar reproducción automática del carrusel" })
      .click();
    await page.clock.fastForward(6_500);
    await expect(counter).toHaveText("3");

    // La tarjeta tiene una superficie de vidrio con desenfoque.
    const backdrop = await page
      .locator(".carousel-slide-inner")
      .first()
      .evaluate(element => getComputedStyle(element).backdropFilter);
    expect(backdrop).toContain("blur");

    const progressVisible = await page.locator(".carousel-progress").isVisible();
    expect(progressVisible).toBe(true);
  });
});
