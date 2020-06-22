//TODO 
//send cookies as param
//send tokens
//

const querystring = require('querystring');

const axios = require('axios')

class Account {
  constructor(userName,cookies) {
    this._userName = userName;

    this._csrftoken = cookies.find(i => i.name == 'csrftoken')
    this._shbid = cookies.find(i => i.name == 'shbid')
    this._sessionid = cookies.find(i => i.name == 'sessionid')
    



  }
  
  async init(){
    this._userId = await this.getUserId(this._userName)
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
    console.log('Dumping')
    console.log(this._sessionid)
    console.log(this._shbid)
    console.log(this._userName)
    console.log(this._csrftoken)
  }


async follow(userName){
  const userId = await this.getUserId(userName)
  
  
  const URL = 'https://www.instagram.com/web/friendships/'+userId+'/follow/';

  const res = await this.postData(URL)
  if (res.status == '200'){
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
    return true
  }
  else{
    return false
  }
}

async  getUsers(QUERY_HASH){
   
  let nextCursor = ''  
  let users = []
  

  let isNextPage = true

  const isFollower = (QUERY_HASH ==  'c76146de99bb02f6415203be841dd25a')? true : false //true = follower
  while(isNextPage){
    


    let query_variables = '{"id": '+this._userId+',"include_reel":true,"fetch_mutual":false,"first":50,"after":"'+nextCursor+'"}'
    let variables = encodeURIComponent(query_variables);
    let URL = 'https://www.instagram.com/graphql/query/?query_hash='+QUERY_HASH+'&variables='+variables;

    let response = await this.parseData(URL,isFollower);
  
    
    users = [...users, ...response.users]
    

    
    nextCursor = response.nextCursor 
    isNextPage = (nextCursor) ? true : false
  }
    return users
}

async getFollowing(){
  const QUERY_HASH = 'd04b0a864b4b54837c0d870b0e77e076'; //Following
  return await this.getUsers(QUERY_HASH)
}

async getFollowers(){
  const QUERY_HASH = 'c76146de99bb02f6415203be841dd25a'; //Followers
  return await this.getUsers(QUERY_HASH)
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
    console.log(e)
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
    console.log(e)
  }
}

async getGarcas(WHITELIST){
  //A garca is who you follow but it didn't follow you back
  

  const {followers, following} = await this.getAccountData(this._userName)
  
  //No include following in followers
  const users = following.filter( i => !followers.includes(i));
 
  const garcas = (WHITELIST)? users.filter( i => !WHITELIST.includes(i)) : users
  return garcas


}

async getFans(){
  //A garca is who you follow but it didn't follow you back
  

  const {followers, following} = await this.getAccountData(this._userName)

  const users = followers.filter( i => !following.includes(i));

  return users


}


async getMutuals(){

  const {followers, following} = await this.getAccountData(this._userName)

  const users = followers.filter( i => following.includes(i));
  
  return users


}

async getUserId(userName){
  
  const URL = 'https://www.instagram.com/'+userName+'/?__a=1'

  const response = await this.getData(URL);
  return response.data.graphql.user.id
}


async getAccountData(){
  
  const followers = await this.getFollowers(this._userId);
  const following = await this.getFollowing(this._userId);
  
  return {
    followers,
    following
  }
}


}


exports.Account = Account
