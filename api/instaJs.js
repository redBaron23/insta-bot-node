//TODO
//
//unfollowGarcas
const path = require('path')
const fs = require('fs');


const appDir = path.dirname(require.main.filename);

const helper = require(appDir+'/api/helper')

const PATO_GARCAS_URI = appDir+'/api/data/pato.toledo-garcas.json'
const FAMOUS_URI = appDir+'/api/data/accountFamous.json'

const accountHelper = require(appDir+'/api/accountHelper')


	



async function farmFamous(USERNAME,PASSWORD){
  
  let rawdata = fs.readFileSync(PATO_GARCAS_URI);
  const patoWhiteList = JSON.parse(rawdata);
  rawdata = fs.readFileSync(FAMOUS_URI);
  const ACCOUNT_FAMOUS = JSON.parse(rawdata)
	//let garcas = await accountHelper.getGarcas('pato.toledo',patoWhitelist)
  	let response = {};
	const bounces = 10000;
	let account = new accountHelper.Account(USERNAME,PASSWORD);
	await account.init()
	account.follow('pato.toledo')
}
async function bounceAccounts(account,bounces){

  const MIN_TIME = 300000;//5min
  const MAX_TIME = 1200000;//20min
  let timeBounce = 0;
  let timeBetween = 0;
  let used = 0;

  for (i = 0; i < bounces; i++) {
    console.log('Bounce number: '+i+' at time: '+ await helper.dateTime()) 
   
    //Unfollow all accounts
    await unfollowAccounts(account);
 
    //await helper.sleepRandom(MIN_TIME,MAX_TIME)
    console.log('Termine_______') 
 //Follow all accounts
    //await followAccounts(account);
    await helper.sleepRandom(MIN_TIME,MAX_TIME)


  }
}


async function unfollowAccounts(account){
  
  const MIN_TIME = 30000; //5min
  const MAX_TIME = 60000;//10min
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
      await helper.sleepRandom(MIN_TIME,MAX_TIME)
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
    
      await helper.sleepRandom(MIN_TIME,MAX_TIME)
      i++
    }
   }
}







exports.farmFamous = farmFamous;
//exports.start = start;
