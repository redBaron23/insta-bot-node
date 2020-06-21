const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://www.jd.com');
    await page.setViewport({
        width: 1200,
        height: 800
    });
    let DATA = '#app > div > div.lc-floor.lc-xfloor--id-1558339050000.lc-floor--lg > div > div > div.lc-col.lc-col--cols5-3 > div > div > div > div > div.lc-ad-swiper__main > ul'
const date = await page.evaluate((DATA) => document.querySelector(DATA).innerHTML, DATA);
console.log(date)
    
})();

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
