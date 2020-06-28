//TODO
//
//Farm famous option in data/user/config (ON/OFF)
const path = require('path')
const fs = require('fs');

const colors = require('colors')
const appDir = path.dirname(require.main.filename);

const helper = require(appDir+'/api/helper')

const PATO_GARCAS_URI = appDir+'/api/data/pato.toledo-garcas.json'
const FAMOUS_URI = appDir+'/api/data/accountFamous.json'

const accountHelper = require(appDir+'/api/accountHelper')

let rawdata = fs.readFileSync(FAMOUS_URI);
const ACCOUNTS_FAMOUS = JSON.parse(rawdata)
 
	
const bounces = 10000;



async function farmFamous(USERNAME,PASSWORD){
  let _status
  try{
    let rawdata = fs.readFileSync(PATO_GARCAS_URI);
    const patoWhiteList = JSON.parse(rawdata);
   //let garcas = await accountHelper.getGarcas('pato.toledo',patoWhitelist)
    let response = {};
    let account = new accountHelper.Account(USERNAME,PASSWORD);
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

async function followUserFollows(account){
  //TODO
  //Resolve the loop
  console.log('Empieza')
  const userName = 'psicologia_memes'
  try{
  const followers = await account.getUserFollowers(userName)
  console.log(followers)
 // for (i = 0; i < follwers.length; i++ {
   // console.log(followers[i])
  //}
  for (let i of followers){
    console.log(i)
  }

  }
  catch(e){
    console.log('Too many request')
  }

}

async function bounceAccounts(account,bounces){

  const MIN_TIME = 300000;//5min
  const MAX_TIME = 1200000;//20min
  let timeBounce = 0;
  let timeBetween = 0;
  let used = 0;

  for (i = 0; i < bounces; i++) {
    console.log('Bounce number: '+colors.red(i) )
    //Follow all accounts
    await followAccounts(account);
   
    console.log('At time: '+ await helper.dateTime())
    
    await helper.sleepRandom(MIN_TIME,MAX_TIME)
    console.log('Termine_______') 
    //Unfollow all accounts
    await unfollowAccounts(account);
    await helper.sleepRandom(MIN_TIME,MAX_TIME)


  }
}


async function unfollowAccounts(account){
  
  const MIN_TIME = 90000; //5min
  const MAX_TIME = 180000;//10min
  let timeout = 0;
  let i = 1
  console.log('Unfollowing: '+ ACCOUNTS_FAMOUS.length)
  for (let userName of ACCOUNTS_FAMOUS){
    console.log('Unfollowing: ' + (i +'/'+ ACCOUNTS_FAMOUS.length).green)
    
    console.log('At time: '+ await helper.dateTime())
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
  
  const MIN_TIME = 90000; //5min
  const MAX_TIME = 180000;
  
  let timeout = 0;
  let i = 1
  console.log('Following: '+ ACCOUNTS_FAMOUS.length)
   for (let userName of ACCOUNTS_FAMOUS){
	   if(!userName){
	   	console.log('Vacio en la posicion'+i)
	   }
    console.log('Following: ' + (i +'/'+ ACCOUNTS_FAMOUS.length).green)
    console.log('At time: '+ await helper.dateTime())
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
