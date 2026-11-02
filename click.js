const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto('https://www.mylovers.online/discover', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('Final URL:', page.url());

    const info = await page.evaluate(() => ({
      inputs: [...document.querySelectorAll('input')].map(i => ({
        type: i.type, name: i.name, id: i.id, placeholder: i.placeholder
      })),
      buttons: [...document.querySelectorAll('button, a[role="button"]')].map(b => ({
        text: b.innerText.trim().slice(0, 50), id: b.id, cls: b.className.toString().slice(0, 60)
      })),
    }));
    console.log(JSON.stringify(info, null, 2));

    await page.screenshot({ path: 'error.png', fullPage: true });
    fs.writeFileSync('page.html', await page.content());
  } finally {
    await browser.close();
  }
})();
