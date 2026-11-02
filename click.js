const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto('https://www.mylovers.online/discover', { waitUntil: 'networkidle' });

    await page.fill('input[type="email"]', process.env.SITE_USER);
    await page.fill('input[type="password"]', process.env.SITE_PASS);
    await page.click('button:has-text("Sign In")');

    // wait for the login form to disappear
    await page.waitForSelector('input[type="password"]', { state: 'detached', timeout: 20000 });
    await page.waitForTimeout(4000);

    console.log('LOGIN OK. URL:', page.url());

    const buttons = await page.evaluate(() =>
      [...document.querySelectorAll('button, a[role="button"]')].map(b => ({
        text: b.innerText.trim().slice(0, 50),
        id: b.id,
        cls: b.className.toString().slice(0, 60),
      }))
    );
    console.log(JSON.stringify(buttons, null, 2));

    await page.screenshot({ path: 'after-login.png', fullPage: true });
  } catch (err) {
    console.log('LOGIN FAILED:', err.message);
    await page.screenshot({ path: 'after-login.png', fullPage: true });
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
