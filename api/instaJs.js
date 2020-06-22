const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path')
const fs = require('fs');


const appDir = path.dirname(require.main.filename);

const helper = require(appDir+'/api/helper')

const PATO_GARCAS_URI = appDir+'/api/data/pato.toledo-garcas.json'

const accountHelper = require(appDir+'/api/accountHelper')

const HEADLESS = false;

const BROWSER = 'chromium';






async function start(USERNAME,PASSWORD){
  
  const rawdata = fs.readFileSync(PATO_GARCAS_URI);
  const patoWhitelist = JSON.parse(rawdata);

	//let garcas = await accountHelper.getGarcas('pato.toledo',patoWhitelist)
  	let response = {};
	const bounces = 1000;
	const browser = await puppeteer.launch({executablePath: BROWSER,headless: HEADLESS});
	let page = await browser.newPage();
	await page.goto('https://www.instagram.com');
	
	//Login insta
	await logIn(page,USERNAME,PASSWORD)
	
	//Get cookies
	const cookies = await getCookies(page,USERNAME);



	let ACCOUNTS = ["mileycyrus","jlo","kendalljenner","neymarjr","beyonce","kimkardashian","kyliejenner","natgeo","leomessi","justinbieber","cristiano","arianagrande","therock"]
	//await bounceAccounts(page,ACCOUNTS,bounces)
        	console.log(cookies)	
}

async function getCookies(page,USERNAME){
  const usefulCookies = [
    "sessionid",
    "csrftoken",
    "shbid"
  ]
  await goToProfile(page,USERNAME)
  const browserCookies = await page.cookies();
  const cookies = browserCookies.filter(i => usefulCookies.includes(i.name))
  return cookies
}


async function logIn(page,USERNAME,PASSWORD){
   
  const USER_INPUT = '#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(2) > div > label > input';

  const PASS_INPUT = '#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(3) > div > label > input';

  const LOGIN_BTN = '#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(4) > button > div';



  await page.waitForSelector(USER_INPUT,{timeout: 5000})
  await page.focus(USER_INPUT);
  await page.keyboard.type(USERNAME,{delay:50})

  await page.focus(PASS_INPUT);
  await page.keyboard.type(PASSWORD,{delay:50})
  try{
    const btn =await page.waitForSelector(LOGIN_BTN, {timeout: 5000})
    await btn.evaluate( btn => btn.click())
    console.log('Logged Successful()')
  }
  catch(e){
    console.log('Could not login');
  }

}


async function bounceAccounts(page,ACCOUNTS,bounces){

  const MIN_TIME = 1200;	//2min
  const MAX_TIME = 6000;	//10min
  let timeBounce = 0;
  let timeBetween = 0;
  let used = 0;

  for (i = 0; i < bounces; i++) {
    console.log('Bounce number: '+i) 
    //Follow all accounts
    await helper.checkMemory();
    await followAccounts(page,ACCOUNTS);
    
    timeBetween = await helper.getRandom(MIN_TIME,MAX_TIME)
    console.log('Time remaining between follow/unfollow' +' '+timeBetween/1000)
    await helper.checkMemory()
    await helper.sleep(timeBetween);
    
    //Unfollow all accounts
    await unfollowAccounts(page,ACCOUNTS);

    timeBounce = await helper.getRandom(MIN_TIME,MAX_TIME)
    console.log('Time remaining for the next bounce: '+' '+ timeBounce/1000)
    await helper.checkMemory()
    await helper.sleep(timeBounce)


  }
}


async function unfollowAccounts(page,ACCOUNTS){
  
  const MIN_TIME = 2000;
  const MAX_TIME = 100000
  let timeout = 0;
  let i = 1
  
  console.log('Unfollowing: '+ ACCOUNTS.length)
  for (let account of ACCOUNTS){
    console.log(account + ' ' + i +'/'+ ACCOUNTS.length)
    
    await unfollow(page,account)
    
    //timeout
    timeout = await helper.getRandom(MIN_TIME,MAX_TIME)
    console.log("Waiting for: "+timeout/1000)
    await helper.sleep(timeout);
    i++
  }
}
async function followAccounts(page,ACCOUNTS){
  
  const MIN_TIME = 2000;
  const MAX_TIME = 100000
  
  let timeout = 0;
  let i = 1
  console.log('Following: '+ ACCOUNTS.length)
   for (let account of ACCOUNTS){
    console.log(account + ' ' + i +'/'+ ACCOUNTS.length)
    
    await follow(page,account)
    
    //timeout
    timeout = await helper.getRandom(MIN_TIME,MAX_TIME)
    console.log("Waiting for: "+ timeout/1000)
    await helper.sleep(timeout);
    
    i++
   }
}

async function follow(page,USERNAME){
  
  const FOLLOW_BTN = '#react-root > section > main > div > header > section > div.nZSzR > div.Igw0E.IwRSH.eGOV_._4EzTm > span > span.vBF20._1OSdk > button'

  await goToProfile(page,USERNAME);
  
  await page.waitForSelector(FOLLOW_BTN,{timeout:5000})
  try{
    await helper.sleep(5000)
    const btn =await page.waitForSelector(FOLLOW_BTN, {timeout: 5000})
    await btn.evaluate( btn => btn.click())
    console.log('Followed Successful()')
  }
  catch(e){
    console.log('Could not follow');
  }

}

async function unfollow(page,USERNAME){
  
  const UNFOLLOW_BTN = '#react-root > section > main > div > header > section > div.nZSzR > div.Igw0E.IwRSH.eGOV_._4EzTm > span > span.vBF20._1OSdk > button'

  await goToProfile(page,USERNAME);
  
  await page.waitForSelector(UNFOLLOW_BTN,{timeout:5000})
  try{
    const btn =await page.waitForSelector(UNFOLLOW_BTN, {timeout: 5000})
    await btn.evaluate( btn => btn.click())
    await page.waitFor(2000);
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    console.log('Unfollowed Successful()')
  }
  catch(e){
    console.log('Could not follow');
  }


}

async function getFollowing(page,USERNAME){
  
  const ELEMENTS = 'body > div.RnEpo.Yx5HN > div > div > div.isgrP > ul > div'
  const FOLLOWING_BOX = 'body > div.RnEpo.Yx5HN > div > div > div.isgrP';
  const FOLLOWING_BTN = '#react-root > section > main > div > header > section > ul > li:nth-child(3) > a';

  await goToProfile(page,USERNAME);
  
 try{
    const btn =await page.waitForSelector(FOLLOWING_BTN, {timeout: 5000})
    await btn.evaluate( btn => btn.click())
    
   //page.keyboard.press('Tab');
   //await autoScroll(page);
   // page.keyboard.press('PageDown')
    
    //actual_size = document.querySelector(ELEMENTS).children.length;
    
   // console.log(actual_size);

   console.log('22 Logged Successful()')
  }
  catch(e){
    console.log('Could not get following users');
  }



}


async function goToProfile(page,USERNAME){
  
  const SEARCH_INPUT = '#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.LWmhU._0aCwM > input';

  const USER_ELEM = '#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.LWmhU._0aCwM > div:nth-child(4) > div.drKGC > div > a'
  //const PROFILE_BTN = '#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > a'

  try{
    
    await page.waitForSelector(SEARCH_INPUT,{timeout: 5000})
    await page.focus(SEARCH_INPUT);
    await page.keyboard.type(USERNAME,{delay:50})
    await page.waitFor(2000);
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')
 
    console.log('In profile: '+ USERNAME)
  }
  catch(e){
    console.log('Could not get to main profile')
  }

}









///Funcs
//
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




///

exports.start = start;
