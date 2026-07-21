const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 734, height: 780 });
  await page.goto('http://localhost:4200/todos', { waitUntil: 'networkidle0' });
  
  await page.screenshot({ path: '/Users/yigit/Documents/Staj/screenshot-734.png' });
  await browser.close();
  console.log('Screenshot saved to screenshot-734.png');
})();
