//TODO 
//send cookies as param
//send tokens
//

const querystring = require('querystring');

const axios = require('axios')


async  function getUsers(QUERY_HASH,USER_ID){
   
  let nextCursor = ''  
  let users = []
  

  let isNextPage = true

  const isFollower = (QUERY_HASH ==  'c76146de99bb02f6415203be841dd25a')? true : false //true = follower
  while(isNextPage){
    


    let query_variables = '{"id": '+USER_ID+',"include_reel":true,"fetch_mutual":false,"first":50,"after":"'+nextCursor+'"}'
    let variables = encodeURIComponent(query_variables);
    let URL = 'https://www.instagram.com/graphql/query/?query_hash='+QUERY_HASH+'&variables='+variables;

    let response = await parseData(URL,isFollower);
  
    
    users = [...users, ...response.users]
    

    
    nextCursor = response.nextCursor 
    isNextPage = (nextCursor) ? true : false
  }
    console.log(users.length);
    return users
}

async function getFollowing(USER_ID){
  const QUERY_HASH = 'd04b0a864b4b54837c0d870b0e77e076'; //Following
  return await getUsers(QUERY_HASH, USER_ID)
}

async function getFollowers(USER_ID){
  const QUERY_HASH = 'c76146de99bb02f6415203be841dd25a'; //Followers
  return await getUsers(QUERY_HASH, USER_ID)
 }


async function parseData(URL,isFollower){
  let nextCursor = false;

  const HEADERS =  {
      'Accept': '*/*',
      'Cookie':"sessionid=3141516731%3AlPbgbXEGf4jBnd%3A28; shbid=13095",
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'X-CSRFToken': 'ogInnoNhU8PmiBhxteMRKHsTFkdgiozb',
      'X-IG-App-ID': '936619743392459',
      'X-IG-WWW-Claim': 'hmac.AR219pFWs-qIxhqhubZT5W5dTLRV0tSHDzJDtK0-cg2BwLdF',
      'X-Requested-With': 'XMLHttpRequest',
      'Connection': 'close',
      'Referer': 'https://www.instagram.com/pato.toledo/followers/?hl=es-la',
      'Host': 'www.instagram.com'
    }

  const response = await getData(URL,HEADERS);
  

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

async function getData(URL,HEADERS){

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

async function getGarcas(USERNAME){
  //A garca is who you follow but it didn't follow you back
  

  const {followers, following} = await getAccountData(USERNAME)
  const users = following.filter( i => !followers.includes(i));

  return users


}

async function getFans(USERNAME){
  //A garca is who you follow but it didn't follow you back
  

  const {followers, following} = await getAccountData(USERNAME)

  const users = followers.filter( i => !following.includes(i));

  return users


}


async function getMutuals(USERNAME){

  const {followers, following} = await getAccountData(USERNAME)

  const users = followers.filter( i => following.includes(i));
  
  return users


}

async function getUserId(USERNAME){
  
  const URL = 'https://www.instagram.com/'+USERNAME+'/?__a=1'

  const response = await getData(URL);
  return response.data.graphql.user.id
}


async function getAccountData(USERNAME){
  
  const USER_ID = await getUserId(USERNAME) 
  const followers = await getFollowers(USER_ID);
  const following = await getFollowing(USER_ID);
  
  return {
    followers,
    following
  }
}


exports.getAccountData = getAccountData
exports.getMutuals = getMutuals
exports.getGarcas = getGarcas
exports.getFans = getFans
