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

const _username = 'redbaron397'
const _password = 'Sega1072_'
//Helper account
let _account = new accountHelper.Account(_username,_password);
_account.init();

const bounces = 10000;



async function farmFamous(USERNAME,PASSWORD){
  let rawdata = fs.readFileSync(FAMOUS_URI);
  const ACCOUNTS_FAMOUS = JSON.parse(rawdata)
   let _status
  try{
   //let garcas = await accountHelper.getGarcas('pato.toledo',patoWhitelist)
    let response = {};
    let account = new accountHelper.Account(USERNAME,PASSWORD);
    await account.init()
    //FamousFarm

    bounceAccounts(account,bounces,ACCOUNTS_FAMOUS)
    _status = 'Farm famous started'
  }
  catch(e){
    console.log(e)
    _statuis = 'Hubo un error'
  }
  return _status
}


async function followUserFollowers(USERNAME,PASSWORD){
   let _status;
  try{
   //let garcas = await accountHelper.getGarcas('pato.toledo',patoWhitelist)
    let response = {};
    let account = new accountHelper.Account(USERNAME,PASSWORD);
    await account.init()  
    const userName = 'psicologia_memes'
    followAll(account,userName)
    _status = 'Follow user Followers started'
  }
  catch(e){
    _status = 'Hubo un error'
    console.log('Too many request')
  }
  return _status

}
async function unfollowSession(USERNAME,PASSWORD){
  let _response;
  try{
    let account = new accountHelper.Account(USERNAME,PASSWORD)
    await account.init()


    const sessioners = await account.sessionFollowed()
    console.log(sessioners)
    console.log(('Unfollowing: '+sessioners.length+ ' session followeds').green)
    unfollowAccounts(account,sessioners)

    _response = 'Unfollow session followed started'
  }
  catch(e){
    _response = 'Hubo un error'
    console.log('Error at unfollow session')
  }
  return _response
}
async function unfollowGarcas(USERNAME,PASSWORD){
  let _response;
  try{
    let account = new accountHelper.Account(USERNAME,PASSWORD)
    await account.init()

    await account.follow('justinbieber')
    await account.follow('leomessi')
    const garcas = await account.getGarcas()
    console.log(('Unfollowing: '+garcas.length+ ' garcas').green)
    unfollowAccounts(account,garcas)

    _response = 'Unfollow garcas started'
  }
  catch(e){
    _response = 'Hubo un error'
    console.log('Error at unfollow garcas')
  }
  return _response
}

async function followAll(account,userName){

  const MIN_TIME = 300000;//5min
  const MAX_TIME = 1200000;//20min
 

    //following/followers
    const ratio = 0.2

    const rSize = 500 //Number of users per request (lower better to don't get a ban)
    const totalFollowers = await _account.countFollowers(userName);
    const times = Math.trunc(totalFollowers / rSize)+1
    //const totalFollowing = await account.countFollowing(userName);
    console.log('Going to follow ~'+String(totalFollowers).red+' from '+userName.green+' in '+String(times).blue+' times')
    
    for (i=0; i < times; i++){
      
      console.log(String(i+'/'+times).red)
      console.log('At time: '+ await helper.dateTime())

      let followers = await _account.getUserFollowers(userName,rSize)
      
      
      //Just follow users
      await followAccounts(account,followers,ratio);
      
      //timeout
      await helper.sleepRandom(MIN_TIME,MAX_TIME)
    } 
}
async function isViable(userName,ratio){
  
  const realRatio = (ratio) ? ratio : 0.23
  const followers = await _account.countFollowers(userName);
  const following = await _account.countFollowing(userName);
  
  const currentRatio = following/followers

  const _status = (currentRatio >= realRatio)
  
  return _status

}
async function bounceAccounts(account,bounces,ACCOUNTS_FAMOUS){

  const MIN_TIME = 300000;//5min
  const MAX_TIME = 1200000;//20min
  let timeBounce = 0;
  let timeBetween = 0;
  let used = 0;

  for (i = 0; i < bounces; i++) {
    console.log('Bounce number: '+colors.red(i) )
    //Follow all accounts
    await followAccounts(account,ACCOUNTS_FAMOUS);
   
    console.log('At time: '+ await helper.dateTime())
    
    await helper.sleepRandom(MIN_TIME,MAX_TIME)
    console.log('Termine_______') 
    //Unfollow all accounts
    await unfollowAccounts(account,ACCOUNTS_FAMOUS);
    await helper.sleepRandom(MIN_TIME,MAX_TIME)


  }
}


async function unfollowAccounts(account,ACCOUNTS_FAMOUS){
  
  const MIN_TIME = 300000; //5min
  const MAX_TIME = 420005; //7min
  let timeout = 0;
  let i = 1
  console.log('Unfollowing: '+ ACCOUNTS_FAMOUS.length)
  for (let userName of ACCOUNTS_FAMOUS){
    console.log('Unfollowing: ' + (i +'/'+ ACCOUNTS_FAMOUS.length +' '+userName).green)
    
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
async function followAccounts(account,ACCOUNTS_FAMOUS,ratio){
  
  const MIN_TIME = 300000; //5min
  const MAX_TIME = 420005; //7min
  
  let timeout = 0;
  let i = 1
  console.log('Following: '+ ACCOUNTS_FAMOUS.length)
   for (let userName of ACCOUNTS_FAMOUS){
	   if(!userName){
	      console.log('Vacio en la posicion'+i)
	   }
    console.log('Following: ' + (i +'/'+ ACCOUNTS_FAMOUS.length +' '+userName).green)
    console.log('At time: '+ await helper.dateTime())
    try{ 

      if ((!ratio) || (await isViable(userName,ratio))){
	console.log(String('Going to follow '+userName).green)
	await account.follow(userName)
      }
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









exports.unfollowSession = unfollowSession;
exports.unfollowGarcas = unfollowGarcas;
exports.farmFamous = farmFamous;
exports.followUserFollowers = followUserFollowers
//exports.start = start;
