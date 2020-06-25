const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path')
const fs = require('fs');


const appDir = path.dirname(require.main.filename);

const helper = require(appDir+'/api/helper')

const PATO_GARCAS_URI = appDir+'/api/data/pato.toledo-garcas.json'

const accountHelper = require(appDir+'/api/accountHelper')

const HEADLESS = true;

const BROWSER = 'chromium-browser';

const ACCOUNTS_FAMOUS = ["instagram","cristiano","arianagrande","therock","kyliejenner","selenagomez","kimkardashian","leomessi","beyonce","neymarjr","justinbieber","natgeo","taylorswift","kendalljenner","jlo","nickiminaj","nike","khloekardashian","mileycyrus","katyperry","kourtneykardash","kevinhart4real","theellenshow","realmadrid","fcbarcelona","ddlovato","badgalriri","zendaya","victoriassecret","iamcardib","champagnepapi","shakira","chrisbrownofficial","kingjames","vindiesel","billieeilish","virat.kohli","davidbeckham","championsleague","nasa","justintimberlake","emmawatson","shawnmendes","gigihadid","priyankachopra","9gag","ronaldinho","maluma","camilacabello","nba","aliaabhatt","shraddhakapoor","Anita","marvel","dualipa","snoopdogg","robertdowneyjr","willsmith","Jamesrodriguez10","marcelotwelve","hudabeauty","caradelevingne","leonardodicaprio","nikefootball","garethbale11","zlatanibrahimovic","chrishemsworth","narendramodi","zacefron","ladygaga","jacquelinef143","raffinagita1717","whinderssonnunes","5.min.crafts","tatawerneck","paulpogba","jbalvin","ayutingting92","lelepons","k.mbappe","akshaykumar","gucci","Juventus","chanelofficial","daddyyankee","michelleobama","zara","gal_gadot","nehakakkar","natgeotravel","sergioramos","vanessahudgens","mosalah","katrinakaif","paulodybala","premierleague","louisvuitton","anushkasharma","luissuarez9"] 
	



async function farmFamous(USERNAME,PASSWORD){
  
  const rawdata = fs.readFileSync(PATO_GARCAS_URI);
  const patoWhitelist = JSON.parse(rawdata);

	//let garcas = await accountHelper.getGarcas('pato.toledo',patoWhitelist)
  	let response = {};
	const bounces = 10000;
	const browser = await puppeteer.launch({executablePath: BROWSER,headless: HEADLESS});
	let page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');


	await page.goto('https://www.instagram.com');
	
	//Login insta
	await logIn(page,USERNAME,PASSWORD)
		
	  let _status
	try{
	//Get cookies
	 const cookies = await getCookies(page,USERNAME);
  	//accountHelper.getGarcas(USERNAME,COOKIES,WHITELIST)
	  browser.close();	
	//Open account
	  let account = new accountHelper.Account(USERNAME,cookies);
	  await account.init()
	
	//FamousFarm
	  bounceAccounts(account,bounces)
	  _status = 'Farm famous started'
	}
	catch(e){
	  console.log(e)
	  _statuis = 'Hubo un error'
	}
  return _status
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
  if (cookies.length == 3){
    console.log('Session created')
  }
  else{
    throw('ERROR AT LOGIN')
  }
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


async function bounceAccounts(account,bounces){

  const MIN_TIME = 300000;//5min
  const MAX_TIME = 1200000;//20min
  let timeBounce = 0;
  let timeBetween = 0;
  let used = 0;

  for (i = 0; i < bounces; i++) {
    console.log('Bounce number: '+i) 
   
    //Unfollow all accounts
    await unfollowAccounts(account);
 
    timeBetween = await helper.getRandom(MIN_TIME,MAX_TIME)
    console.log('Minutes remaining between follow/unfollow' +' '+timeBetween/(1000/60))
    await helper.sleep(timeBetween);
 
 //Follow all accounts
    await followAccounts(account);
    timeBounce = await helper.getRandom(MIN_TIME,MAX_TIME)
    console.log('Minutes remaining for the next bounce: '+' '+ timeBounce/(1000/60))
    await helper.sleep(timeBounce)


  }
}


async function unfollowAccounts(account){
  
  const MIN_TIME = 300000; //5min
  const MAX_TIME = 600000;//10min
  let timeout = 0;
  let i = 1
  console.log('Unfollowing: '+ ACCOUNTS_FAMOUS.length)
  for (let userName of ACCOUNTS_FAMOUS){
    console.log('Unfollowing: '+userName + ' ' + i +'/'+ ACCOUNTS_FAMOUS.length)
    
    try{ 
      await account.unfollow(userName)
    }
    catch(e){
      console.log('Account not followed')
    }
    finally{
    //timeout
      timeout = await helper.getRandom(MIN_TIME,MAX_TIME)
      console.log("Waiting min: "+ timeout/(1000*60))
      await helper.sleep(timeout);
    
      i++
    }
  }
}
async function followAccounts(account){
  
  const MIN_TIME = 300000;
  const MAX_TIME = 600000;
  
  let timeout = 0;
  let i = 1
  console.log('Following: '+ ACCOUNTS_FAMOUS.length)
   for (let userName of ACCOUNTS_FAMOUS){
	   if(!userName){
	   	console.log('Vacio en la posicion'+i)
	   }
    console.log('Following: '+userName + ' ' + i +'/'+ ACCOUNTS_FAMOUS.length)
    try{ 
      await account.follow(userName)
    }
    catch(e){
      console.log('Account not followed')
    }
    finally{
    //timeout
      timeout = await helper.getRandom(MIN_TIME,MAX_TIME)
      console.log("Waiting min "+ timeout/(1000*60))
      await helper.sleep(timeout);
    
      i++
    }
   }
}

// DEPRECATED
//
/*
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

*/

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






exports.farmFamous = farmFamous;
//exports.start = start;
