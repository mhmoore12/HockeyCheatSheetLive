import { expect, test } from '@playwright/test';

test('moves the puck and keeps both teams readable', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Where should I go?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Loose puck' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await page.locator('.rink-card').screenshot({ path: testInfo.outputPath('faceoff.png') });

  await page.getByRole('button', { name: 'Blue', exact: true }).click();
  const rink = page.locator('canvas');
  const bounds = await rink.boundingBox();
  expect(bounds).not.toBeNull();
  await rink.click({ position: { x: bounds!.width * 0.8, y: bounds!.height * 0.2 } });

  await expect(page.locator('.current-read strong')).toContainText('Blue has the puck');
  await expect(page.locator('.lesson-banner strong')).toContainText(
    'Blue: Offensive zone · Upper lane',
  );

  await page.mouse.move(bounds!.x + bounds!.width * 0.8, bounds!.y + bounds!.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + bounds!.width * 0.88, bounds!.y + bounds!.height * 0.28, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.locator('.lesson-banner strong')).toContainText(
    'Blue: Offensive zone · Upper lane',
  );

  await page.getByRole('tab', { name: 'Orange team' }).click();
  await expect(page.locator('.lesson-banner strong')).toContainText(
    'Orange: Defensive zone · Lower lane',
  );
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await page.locator('tbody tr').nth(2).click();
  await expect(page.locator('tbody tr').nth(2)).toHaveClass(/selected/);

  const noHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(noHorizontalOverflow).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('lesson.png'), fullPage: true });
});

test('supports keyboard movement between teaching areas', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === 'landscape-tablet',
    'Physical-keyboard behavior is covered by the desktop browser profile.',
  );
  await page.goto('/');
  const rink = page.locator('canvas');
  await rink.focus();
  await rink.press('ArrowRight');
  await rink.press('ArrowUp');
  await expect(page.locator('.lesson-banner strong')).toContainText(
    'Blue: Offensive zone · Upper lane',
  );
});

test('draws and clears a smoothed markup stroke', async ({ page }, testInfo) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Markup mode' });
  const clear = page.getByRole('button', { name: 'Clear markup' });
  await expect(clear).toBeDisabled();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  const bounds = await page.locator('canvas').boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + bounds!.width * 0.3, bounds!.y + bounds!.height * 0.35);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + bounds!.width * 0.45, bounds!.y + bounds!.height * 0.2, {
    steps: 8,
  });
  await page.mouse.move(bounds!.x + bounds!.width * 0.6, bounds!.y + bounds!.height * 0.38, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(clear).toBeEnabled();
  await expect(page.locator('.lesson-banner strong')).toContainText(
    'Blue: Neutral zone · Middle lane',
  );
  await page.locator('.rink-card').screenshot({ path: testInfo.outputPath('markup.png') });

  await clear.click();
  await expect(clear).toBeDisabled();
});
