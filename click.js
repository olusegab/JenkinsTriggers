const { chromium } = require('playwright');

const TABS = ['Discover', 'Matches', 'Moments', 'Messages', 'Favorites', 'Who Likes Me', 'Visitors'];
const MAX_ATTEMPTS = 4;
const WAIT_BETWEEN_ATTEMPTS_MS = 30000;

async function runOnce(attempt) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(45000);

  try {
    // 'domcontentloaded' instead of 'networkidle', then wait for the form itself
    await page.goto('https://www.mylovers.online/discover', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForSelector('input[type="email"]', { timeout: 45000 });

    await page.fill('input[type="email"]', process.env.SITE_USER);
    await page.fill('input[type="password"]', process.env.SITE_PASS);
    await page.click('button:has-text("Sign In")');

    await page.waitForSelector('input[type="password"]', { state: 'detached', timeout: 30000 });
    await page.waitForTimeout(4000);
    console.log(`[attempt ${attempt}] LOGIN OK. URL: ${page.url()}`);

    for (const tab of TABS) {
      await page.getByText(tab, { exact: true }).first().click({ timeout: 15000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `tab-${tab.replace(/\s+/g, '-')}.png` });
      console.log(`[attempt ${attempt}] Clicked: ${tab}`);
    }
    return true;
  } catch (err) {
    console.log(`[attempt ${attempt}] FAILED: ${err.message.split('\n')[0]}`);
    try { await page.screenshot({ path: `failed-attempt-${attempt}.png` }); } catch {}
    return false;
  } finally {
    await browser.close();
  }
}

(async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (await runOnce(attempt)) {
      console.log('SUCCESS');
      return;
    }
    if (attempt < MAX_ATTEMPTS) {
      console.log(`Waiting ${WAIT_BETWEEN_ATTEMPTS_MS / 1000}s before retrying...`);
      await new Promise(r => setTimeout(r, WAIT_BETWEEN_ATTEMPTS_MS));
    }
  }
  console.log(`All ${MAX_ATTEMPTS} attempts failed.`);
  process.exit(1);
})();
