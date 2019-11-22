const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require("path");

async function scrape(email, pwd, dev){
	if (dev==0) {
		throw "haq"
	}else if(dev == 1){ 
    return true; 
  }
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });// if else block for development phase. do not remove.
	const page = await browser.newPage();
  await page.setDefaultTimeout(5000);
	await page.goto('https://www.jamb.org.ng/eFacility./');
	await page.focus('#email');
	await page.keyboard.type(email);
	await page.focus('#password')
	await page.keyboard.type(pwd);
	await page.click('#lnkLogin');
	await page.waitForSelector('#ctl00');
	await page.evaluate(() => {
		document.querySelectorAll("a[href='CAPSDirect']")[0].click();
	});
	await page.waitForNavigation({ waitUntil: 'networkidle0' })
	await page.evaluate(() => {
		document.querySelectorAll("span[class='nav-label']")[3].click();
	});
	await page.waitForNavigation({ waitUntil: 'networkidle0' });
	await page.screenshot({path: __dirname+'/'+email+'.png', fullPage: true});
	let status = '';
	await page.evaluate(() => document.querySelectorAll("div[class='col-lg-6']")[4].innerHTML ).then((val) => {
		status = val;
	});
	await browser.close();
	return status;
}


module.exports = scrape;