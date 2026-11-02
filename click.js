const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.mylovers.online/login', { waitUntil: 'networkidle' });

    // TODO: replace these selectors with the real ones (right-click > Inspect on the site)
    await page.fill('input[name="username"]', process.env.SITE_USER);
    await page.fill('input[name="password"]', process.env.SITE_PASS);
    await page.click('button[type="submit"]');

    await page.goto('https://www.mylovers.online/discover', { waitUntil: 'networkidle' });

    // TODO: the button you want clicked
    await page.click('button:has-text("Your Button Text")');
    await page.waitForTimeout(2000);

    console.log('Done');
  } catch (err) {
    await page.screenshot({ path: 'error.png', fullPage: true });
    throw err;
  } finally {
    await browser.close();
  }
})();
