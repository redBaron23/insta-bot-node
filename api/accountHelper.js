//TODO 
//send cookies as param
//send tokens
//
const puppeteer = require('puppeteer');
const path = require('path')


const colors = require('colors')

const fs = require('fs')

const appDir = path.dirname(require.main.filename);

const helper = require(appDir+'/api/helper')




const HEADLESS = true;

const BROWSER = 'chromium-browser';



const querystring = require('querystring');

const axios = require('axios')

//Followers/Unfollowers per account
const default_quantity = 10000 

const errTime = {"init":(1000*3600*2),400:(1000*3600*2),429:(1000*3600*12)}




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
async function getCookies(page,USERNAME){
  const usefulCookies = [
    "sessionid",
    "csrftoken",
  ]
  await goToProfile(page,USERNAME)
  const browserCookies = await page.cookies();
  const cookies = browserCookies.filter(i => usefulCookies.includes(i.name))
  if (cookies.length == 2){
    console.log('Session created')
  }
  else{
    throw('ERROR AT GRABBING COOKIES')
  }
  return cookies
}


async function logIn(USERNAME,PASSWORD){
  const browser = await puppeteer.launch({executablePath: BROWSER,headless: HEADLESS});
  let page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

  await page.goto('https://www.instagram.com');
  
  const USER_INPUT = '#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(2) > div > label > input';

  const PASS_INPUT = '#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(3) > div > label > input';

  const LOGIN_BTN = '#react-root > section > main > article > div.rgFsT > div:nth-child(1) > div > form > div:nth-child(4) > button > div';



  await page.waitForSelector(USER_INPUT,{timeout: 5000})
  await page.focus(USER_INPUT);
  await page.keyboard.type(USERNAME,{delay:50})

  await page.focus(PASS_INPUT);
  await page.keyboard.type(PASSWORD,{delay:50})
  try{
    const btn = await page.waitForSelector(LOGIN_BTN, {timeout: 5000})
    await btn.evaluate( btn => btn.click())
    const res = await getCookies(page,USERNAME);
    console.log('Logged Successful()')
    return res
  }
  catch(e){
    console.log(e);
    throw('logIn failed')
  }
  finally{
    browser.close()
  }

}

class Account {
  constructor(userName,passWord) {
    this._userName = userName;
    this._passWord = passWord;


  }
  
  async init(){
    try{
      const cookies = await logIn(this._userName,this._passWord)

      if ( cookies ) {
	this._csrftoken = cookies.find(i => i.name == 'csrftoken')
	this._shbid = '13095' //Never changes
	this._sessionid = cookies.find(i => i.name == 'sessionid')    

	this._userId = await this.getUserId(this._userName)
	this._totalFollowing = await this.countFollowing(this.userName)
	this._totalFollowers = await this.countFollowers(this._userName)


	this._uri = appDir+'/api/data/users/'+this._userName
	helper.createDirectory(this._uri)
	//Saving cookies (no reason why)
	helper.writeJson(cookies,this._uri+'/cookies.json')
       




	//Session data
	let data = {};
	const data_uri = this._uri+'/data.json'
	if (!fs.existsSync(data_uri)){
	  data.userName = this._userName
	  data.firstFollowers = this._totalFollowers
	  data.dateStarted = await helper.dateTime()
	}
	else{
	  data = await helper.readJson(data_uri)
	  data.currentFollowers = this._totalFollowers;
	  data.profitFollowers = this._totalFollowers - data.firstFollowers
	}
	helper.writeJson(data,data_uri)
	return true
      }
      else{
	return false
      }
    }
    catch(e){
      
      console.log(('Could not init the account, retrying in '+(errTime.init)/(1000*3600) +' hours').red)
      await helper.sleep(errTime.init)
      let res = await this.init()
      return res
    }
  
  }
  async update(){

  this._totalFollowing = await this.countFollowing()
  this._totalFollowers = await this.countFollowers()
 }

  get totalFollowing(){
  return this._totalFollowing
  }
  get sessionFollowed(){
    return helper.readJson(this._uri+'/sessionFollowed.json')
  }
  get totalFollowers(){
    return this._totalFollowers
  }
  get csrftoken() {
    return this._csrftoken;
  }  get shbid() {
    return this._shbid;
  }  get sessionid() {
    return this._sessionid;
  }  get userName() {
    return this._userName;
  }
  get userId(){
    return this._userId
  }
  dump() {
    console.log(this._sessionid)
    console.log(this._shbid)
    console.log(this._userName)
    console.log(this._csrftoken)
    console.log('Followers: '+this._totalFollowers)
    console.log('Following: '+this._totalFollowing)
  }


async follow(userName){
  const userId = await this.getUserId(userName)
   
  
  const URL = 'https://www.instagram.com/web/friendships/'+userId+'/follow/';

  const res = await this.postData(URL)
  if (res.status == '200'){
    //Seguidos en esta sesion
    let oldFollowing = []
    const sessionUri = this._uri+'/sessionFollowed.json'

    if (fs.existsSync(sessionUri)){
      oldFollowing = await helper.readJson(this._uri+'/sessionFollowed.json')
    }
    oldFollowing.push(userName);
    
    //remove duplicates
    let newFollowing = oldFollowing.filter((value, index, self) => self.indexOf(value) === index)
    helper.writeJson(newFollowing,this._uri+'/sessionFollowed.json')
    return true
  }
  else{
    return false
  }
}

async unfollow(userName){
  const userId = await this.getUserId(userName)
  
  
  const URL = 'https://www.instagram.com/web/friendships/'+userId+'/unfollow/';

  const res = await this.postData(URL)
  if (res.status == '200'){
    let oldFollowing = []
    const sessionUri = this._uri+'/sessionFollowed.json'

    if (fs.existsSync(sessionUri)){
      oldFollowing = await helper.readJson(this._uri+'/sessionFollowed.json')
    }
    
    //remove unfollowed
    let newFollowing = oldFollowing.filter( i => i !== userName) 
    helper.writeJson(newFollowing,this._uri+'/sessionFollowed.json')
 return true
  }
  else{
    return false
  }
}

async  getUsers(QUERY_HASH,userName,quantity){
  console.log(userName)
  let nextCursor = ''  
  const uri_history = this._uri+'/usersHistory.json'
  //Last time searched for that user
  //If we are looking for ower users, it will not save the history
  let userHistory = {}
  try{
    userHistory = await helper.readJson(uri_history);
    nextCursor = userHistory[userName].nextCursor
  }
  catch(e){
    await helper.writeJson(userHistory,uri_history)
  }
  let users = []
  
  const userId = (userName) ? await this.getUserId(userName) : this._userId
  let isNextPage = true

  const isFollower = (QUERY_HASH ==  'c76146de99bb02f6415203be841dd25a')? true : false //true = follower
  while(isNextPage && users.length <= quantity){
    

    let query_variables = '{"id": '+userId+',"include_reel":true,"fetch_mutual":false,"first":50,"after":"'+nextCursor+'"}'
    let variables = encodeURIComponent(query_variables);
    let URL = 'https://www.instagram.com/graphql/query/?query_hash='+QUERY_HASH+'&variables='+variables;

    let response = await this.parseData(URL,isFollower);
  
    
    users = [...users, ...response.users]
    

    
    nextCursor = response.nextCursor 
    isNextPage = (nextCursor) ? true : false
  }
  const userType = (isFollower) ? 'followers' : 'following'
  userHistory[userName] = {"nextCursor":nextCursor,userType:users}
  helper.writeJson(userHistory,uri_history)
  return users.slice(0,quantity)
}

async getUserFollowing(userName,i){
  const quantity = (i)? i : default_quantity
  const QUERY_HASH = 'd04b0a864b4b54837c0d870b0e77e076'; //Following
  return await this.getUsers(QUERY_HASH,userName,quantity)
}

async getUserFollowers(userName,i){
  const quantity = (i)? i : default_quantity
  const QUERY_HASH = 'c76146de99bb02f6415203be841dd25a'; //Followers
  return await this.getUsers(QUERY_HASH,userName,quantity)
 }

  async getFollowing(i){
    const following = await this.getUserFollowing(this._userName,i)
    helper.writeJson(following,this._uri+'/following.json')
    return following
  }


  async getFollowers(i){
    followers = await this.getUserFollowers(this._userName,i)
    helper.writeJson(followers,this._uri+'/followers.json')
    return followers
  }

async parseData(URL,isFollower){
  let nextCursor = false;

  const response = await this.getData(URL);
  

  const data = (isFollower)? response.data.data.user.edge_followed_by : response.data.data.user.edge_follow
  const isNextPage = data.page_info.has_next_page;
  if (isNextPage){ 
    nextCursor = data.page_info.end_cursor
  }
  



  const array = data.edges;
  const users = array.map( i => i.node.username)
  return {
    users,
    nextCursor
  }
}

async postData(URL){



  const HEADERS =  {
      'Accept': '*/*',
      'Cookie':"sessionid="+this._sessionid.value+"; shbid="+this._shbid.value,
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'X-CSRFToken': this._csrftoken.value,
      'X-IG-App-ID': '936619743392459',
      'X-IG-WWW-Claim': 'hmac.AR219pFWs-qIxhqhubZT5W5dTLRV0tSHDzJDtK0-cg2BwLdF',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Instagram-AJAX': 'nosirve',
      'Connection': 'close',
      'Referer': 'https://www.instagram.com/pato.toledo/followers/?hl=es-la',
      'Host': 'www.instagram.com'
    }
  const options = {
    url: URL, 
    method: 'POST',
    headers: HEADERS 
  };  
  try{
    const response = await axios(options)
    return response
  }
  catch(e) {
    if(e.response.status == 429){
      console.log(('Error 429, TOO MANY REQUEST, waiting '+(errTime[429]/(3600*1000))+' hours and try it again').red)
      await helper.sleep(errTime[429])
      await this.init()
      let res = await this.getData(URL)
      return res
    }
    else if (e.response.status == 400){
      console.log(('Error 400, BAD REQUEST, waiting '+(errTime[400]/(3600*1000))+' hours and try it again').red)
      await helper.sleep(errTime[400])
      await this.init()
      let res = await this.getData(URL)
      return res
     }
    else{
      throw(e)
    }
  }
}


async getData(URL){



  const HEADERS =  {
      'Accept': '*/*',
      'Cookie':"sessionid="+this._sessionid.value+"; shbid="+this._shbid.value,
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'X-CSRFToken': this._csrftoken.value,
      'X-IG-App-ID': '936619743392459',
      'X-IG-WWW-Claim': 'hmac.AR219pFWs-qIxhqhubZT5W5dTLRV0tSHDzJDtK0-cg2BwLdF',
      'X-Requested-With': 'XMLHttpRequest',
      'Connection': 'close',
      'Referer': 'https://www.instagram.com/',
      'Host': 'www.instagram.com'
    }
  const options = {
    url: URL, 
    method: 'GET',
    headers: HEADERS 
  };  
  try{
    const response = await axios(options)
    return response
  }
  catch(e) {
    if(e.response.status == 429){
      console.log(('Error 429, TOO MANY REQUEST, waiting '+errTime[429]+' and try it again').red)
      await helper.sleep(errTime[429])
      await this.init()
      let res = await this.getData(URL)
      return res
    }
    else if (e.response.status == 400){
      console.log(('Error 400, BAD REQUEST, waiting '+errTime[400]+' and try it again').red)
      await helper.sleep(errTime[400])
      await this.init()
      let res = await this.getData(URL)
      return res
     }
    else{
      throw(e)
    }
  } 
}

async getGarcas(WHITELIST){
  //A garca is who you follow but it didn't follow you back
  
  const data_uri = this._uri+'/whiteList.json'
  const whiteList = (fs.existsSync(data_uri) && !WHITELIST) ? await readJson(data_uri) : WHITELIST

  const {followers, following} = await this.getAccountData()
  
  //No include following in followers
  const users = following.filter( i => !followers.includes(i));
 
  const garcas = (whiteList)? users.filter( i => !whiteList.includes(i)) : users
  return garcas


}

async getFans(){
  //A garca is who you follow but it didn't follow you back
  

  const {followers, following} = await this.getAccountData()

  const users = followers.filter( i => !following.includes(i));

  return users


}


async getMutuals(){

  const {followers, following} = await this.getAccountData()

  const users = followers.filter( i => following.includes(i));
  
  return users


}
async countFollowing(userName){
  
  const URL = 'https://www.instagram.com/'+userName+'/?__a=1'

  const response = await this.getData(URL);
  return response.data.graphql.user.edge_follow.count
}


async countFollowers(userName){
  
  const URL = 'https://www.instagram.com/'+userName+'/?__a=1'
  const response = await this.getData(URL);
  return response.data.graphql.user.edge_followed_by.count
}


async getUserId(userName){
  if(userName){ 
    const URL = 'https://www.instagram.com/'+userName+'/?__a=1'
    const response = await this.getData(URL);
    return response.data.graphql.user.id

  }
  else{
    console.log('No username detected')
  }
}

async getAccountData(){
  
  const followers = await this.getFollowers();
  const following = await this.getFollowing();
 
  return {
    followers,
    following
  }
}


}


exports.Account = Account
