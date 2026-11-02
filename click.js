const { chromium } = require('playwright');

const TABS = ['Discover', 'Matches', 'Moments', 'Messages', 'Favorites', 'Who Likes Me', 'Visitors'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let failed = 0;

  try {
    await page.goto('https://www.mylovers.online/discover', { waitUntil: 'networkidle' });

    await page.fill('input[type="email"]', process.env.SITE_USER);
    await page.fill('input[type="password"]', process.env.SITE_PASS);
    await page.click('button:has-text("Sign In")');

    await page.waitForSelector('input[type="password"]', { state: 'detached', timeout: 20000 });
    await page.waitForTimeout(4000);
    console.log('LOGIN OK. URL:', page.url());

    for (const tab of TABS) {
      try {
        await page.getByText(tab, { exact: true }).first().click({ timeout: 10000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `tab-${tab.replace(/\s+/g, '-')}.png` });
        console.log(`Clicked: ${tab} -> ${page.url()}`);
      } catch (err) {
        failed++;
        console.log(`FAILED: ${tab} - ${err.message.split('\n')[0]}`);
        await page.screenshot({ path: `tab-${tab.replace(/\s+/g, '-')}-FAILED.png` });
      }
    }
  } catch (err) {
    failed++;
    console.log('LOGIN FAILED:', err.message.split('\n')[0]);
    await page.screenshot({ path: 'login-failed.png' });
  } finally {
    await browser.close();
  }

  if (failed) process.exitCode = 1;
})();
