import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  page.on("pageerror", (error) => console.error("Browser error:", error.message));
  page.on("requestfailed", (request) => console.error("Request failed:", request.url(), request.failure()?.errorText));
  await page.goto("http://127.0.0.1:3000/biography/journey", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(7000);
  const showFourthStory = async () => {
    await page.evaluate(() => window.scrollTo({ top: 21.5 * innerHeight * .313, behavior: "instant" }));
    await page.waitForTimeout(2500);
  };
  await showFourthStory();
  const activeCard = page.locator('.journey-preview-panel[aria-hidden="false"]');
  assert.equal(await activeCard.count(), 1);
  await page.screenshot({ path: join(tmpdir(), "journey-desktop.png") });
  await activeCard.getByRole("button", { name: "Read the story" }).click();
  await page.getByRole("button", { name: "Close story", exact: true }).click();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('[role="dialog"]').evaluate((el) => el.parentElement.inert), true);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), false);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await showFourthStory();
  await page.screenshot({ path: join(tmpdir(), "journey-mobile.png") });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await activeCard.getByRole("button", { name: "Read the story" }).click();
  assert.equal(await page.getByRole("dialog").isVisible(), true);
  await page.getByRole("button", { name: "Close story", exact: true }).click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("http://127.0.0.1:3000/biography", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(3000);
  const begin = page.getByRole("button", { name: /begin/i });
  await begin.click();
  await page.getByRole("button", { name: /back to globe/i }).click();
  await begin.waitFor({ state: "visible" });
  assert.equal(await begin.isEnabled(), true);
  await begin.click();
  await page.getByRole("button", { name: /back to globe/i }).waitFor({ state: "visible" });
  console.log("Desktop/mobile layout, closed-modal keyboard exclusion, and journey restart checks passed.");
  console.log("Screenshots:", join(tmpdir(), "journey-desktop.png"), join(tmpdir(), "journey-mobile.png"));
} finally {
  await browser.close();
}
