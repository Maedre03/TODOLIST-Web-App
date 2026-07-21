const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:4200/login');
  await page.type('input[type="email"]', 'test@example.com');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
