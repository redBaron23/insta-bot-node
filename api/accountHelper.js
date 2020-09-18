//send cookies this.as param
//send tokens
//
const puppeteer = require("puppeteer");
const path = require("path");

const colors = require("colors");

const fs = require("fs");

const appDir = path.dirname(require.main.filename);

const helper = require(appDir + "/api/helper");

const HEADLESS = false;

const BROWSER = "chromium";

const querystring = require("querystring");

const axios = require("axios");

//Followers/Unfollowers per account
const default_quantity = 10000;

const errTime = {
  init: 1000 * 3600 * 2,
  400: 1000 * 3600 * 0.3,
  429: 1000 * 3600 * 12
};

async function goToProfile(page, USERNAME) {
  try {
    await page.goto("https://www.instagram.com/" + USERNAME);
    console.log("In profile: " + USERNAME);
    await page.waitFor(5000);
  } catch (e) {
    console.log("Could not get to main profile");
  }
}
async function getCookies(page, USERNAME) {
  const usefulCookies = ["sessionid", "csrftoken", "shbid"];
  await goToProfile(page, USERNAME);
  const browserCookies = await page.cookies();
  let cookies = browserCookies.filter(i => usefulCookies.includes(i.name));
  let existCsrftoken = cookies.some(i => i.name === "csrftoken");
  let existSessionid = cookies.some(i => i.name === "sessionid");
  let existShbid = cookies.some(i => i.name === "shbid");
  //not important cookie
  if (existShbid) {
    cookies.push({
      name: "shbid",
      value: "13095",
      domain: ".instagram.com",
      path: "/",
      expires: 1593920567.071231,
      size: 10,
      httpOnly: true,
      secure: true,
      session: false
    });
  }
  if (existCsrftoken && existSessionid) {
    console.log("Session created");
  } else {
    throw "NEED MORE COOKIES";
  }
  return cookies;
}

async function logIn(USERNAME, PASSWORD) {
  const browser = await puppeteer.launch({
    executablePath: BROWSER,
    headless: HEADLESS
  });
  let page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );

  await page.goto("https://www.instagram.com");

  const INSTAGRAM_LOGO =
    "#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.oJZym > a > div > div > img";
  const USER_INPUT =
    "#loginForm > div > div:nth-child(1) > div > label > input";
  const PASS_INPUT =
    "#loginForm > div > div:nth-child(2) > div > label > input";

  const LOGIN_BTN = "#loginForm > div > div:nth-child(3) > button";

  await page.waitForSelector(USER_INPUT, { timeout: 5000 });
  await page.focus(USER_INPUT);
  await page.keyboard.type(USERNAME, { delay: 50 });

  await page.focus(PASS_INPUT);
  await page.keyboard.type(PASSWORD, { delay: 50 });
  try {
    const btn = await page.waitForSelector(LOGIN_BTN, { timeout: 5000 });
    await btn.evaluate(btn => btn.click());
    //To get cookies
    await page.waitForSelector(INSTAGRAM_LOGO, { timeout: 5000 });
    const res = await getCookies(page, USERNAME);
    console.log("Logged Successful()");
    return res;
  } catch (e) {
    let errCode;
    const ERROR_TEXT = "#slfErrorAlert";
    let errorText = await page.$(ERROR_TEXT);

    const message = await page.evaluate(i => i.textContent, errorText);
    if (message.includes("password")) {
      console.log("Incorrect password for " + USERNAME);
      // 401 == incorrect password
      errCode = 401;
    } else {
      // -1 unknown error
      errCode = -1;
      console.log(e);
    }
    throw errCode;
  } finally {
    browser.close();
  }
}

class Account {
  constructor(userName, passWord) {
    this._userName = userName;
    this._passWord = passWord;
    this._isRunning = 0;
    this._action = "";
    this._uri = appDir + "/api/data/users/" + this._userName;
  }

  async countFollows(userName) {
    let following = 100,
      followers = 100;
    const URL = "https://www.instagram.com/" + userName + "/?__a=1";

    const response = await this.getData(URL);
    try {
      following = response.data.graphql.user.edge_follow.count;
      followers = response.data.graphql.user.edge_followed_by.count;
    } catch (e) {
      console.log(e);
      console.log("Setting defaults");
    } finally {
      return [followers, following];
    }
  }
  load(data) {
    if (data) {
      const cookies = data.cookies;

      this._userName = data.userName;
      this._userId = data.userId;

      this._csrftoken = cookies.csrftoken;
      this._shbid = cookies.shbid;
      this._sessionid = cookies.sessionid;
    }
  }
  async init() {
    try {
      console.log("Starting account: " + this._userName);
      console.log("Yendo al logIN");
      const cookies = await logIn(this._userName, this._passWord);

      if (cookies) {
        this._csrftoken = cookies.find(i => i.name == "csrftoken");
        this._shbid = cookies.find(i => i.name == "shbid");
        this._sessionid = cookies.find(i => i.name == "sessionid");

        console.log("Yendo al getUserId");
        this._userId = await this.getUserId(this._userName);

        console.log("Yendo al update");
        await this.update();
        helper.createDirectory(this._uri);
        //Saving cookies (no reason why)
        helper.writeJson(cookies, this._uri + "/cookies.json");

        //Session data
        let data = {};
        const data_uri = this._uri + "/data.json";
        if (!fs.existsSync(data_uri)) {
          data.userName = this._userName;
          data.firstFollowers = this._totalFollowers;
          data.dateStarted = await helper.dateTime();
        } else {
          data = await helper.readJson(data_uri);
          data.currentFollowers = this._totalFollowers;
          data.profitFollowers = this._totalFollowers - data.firstFollowers;
        }
        helper.writeJson(data, data_uri);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      let res;
      console.log("Aca", e);
      if (e === 401) {
        console.log(" Wrong password for", this._userName);
      } else {
        console.log("Unknown error", this._userName);
      }

      throw e;
    }
    return res;
  }
  async update() {
    [this._totalFollowers, this._totalFollowing] = await this.countFollows();
  }

  
  set action(value){
    this._action = value;
  }

  set isRunning(value){
    this._isRunning = value;
  }
  get isRunning(){
    return this._isRunning;
  }

  get action(){
    return this._action;
  }

  get totalFollowing() {
    return this._totalFollowing;
  }

  get totalFollowers() {
    return this._totalFollowers;
  }
  get csrftoken() {
    return this._csrftoken;
  }
  get shbid() {
    return this._shbid;
  }
  get sessionid() {
    return this._sessionid;
  }
  get userName() {
    return this._userName;
  }
  get userId() {
    return this._userId;
  }
  dump() {
    console.log(this._sessionid);
    console.log(this._shbid);
    console.log(this._userName);
    console.log(this._csrftoken);
    console.log("Followers: " + this._totalFollowers);
    console.log("Following: " + this._totalFollowing);
  }

  async sessionFollowed() {
    const path = this._uri + "/sessionFollowed.json";
    console.log(path);
    let res = false;

    try {
      res = await helper.readJson(path);
    } catch (e) {
      console.log(e);
    } finally {
      console.log(res);
      return res;
    }
  }
  async follow(userName) {
    const userId = await this.getUserId(userName);

    const URL =
      "https://www.instagram.com/web/friendships/" + userId + "/follow/";

    const res = await this.postData(URL);
    if (res.status == "200") {
      //Seguidos en esta sesion
      let oldFollowing = [];
      const sessionUri = this._uri + "/sessionFollowed.json";

      if (fs.existsSync(sessionUri)) {
        oldFollowing = await helper.readJson(
          this._uri + "/sessionFollowed.json"
        );
      }
      oldFollowing.push(userName);

      //remove duplicates
      let newFollowing = oldFollowing.filter(
        (value, index, self) => self.indexOf(value) === index
      );
      helper.writeJson(newFollowing, this._uri + "/sessionFollowed.json");
      return true;
    } else {
      return false;
    }
  }

  async removeUserSession(userName) {
    let oldFollowing = [];
    const sessionUri = this._uri + "/sessionFollowed.json";

    if (fs.existsSync(sessionUri)) {
      oldFollowing = await helper.readJson(this._uri + "/sessionFollowed.json");
    }

    //remove unfollowed
    let newFollowing = oldFollowing.filter(i => i !== userName);
    helper.writeJson(newFollowing, this._uri + "/sessionFollowed.json");
  }

  async unfollow(userName) {
    const userId = await this.getUserId(userName);

    const URL =
      "https://www.instagram.com/web/friendships/" + userId + "/unfollow/";

    this.removeUserSession(userName);
    const res = await this.postData(URL);
    if (res.status == "200" || res.status == "404") {
      return true;
    } else {
      return false;
    }
  }

  async unfollowUsers(users) {
    const MIN_TIME = 300000 * 0.6; //5min
    const MAX_TIME = 420005 * 0.6; //7min
    const QUERYs = 20;
    const QUERY_MIN_TIME = 20 * 60 * 1000;
    const QUERY_MAX_TIME = 35 * 60 * 1000;

    let timeout = 0;
    let i = 1;
    let pos = 0;
    console.log(this._userName + " Is going to unfollow: " + users.length);
    for (let userName of users) {
      if (this._isRunning) {
        if (!(i % QUERYs) && i >= QUERYs) {
          //Sleep after 20 querys
          console.log(QUERYs + " querys pasadas, a dormir ".yellow);
          await helper.sleepRandom(QUERY_MIN_TIME, QUERY_MAX_TIME);
        }
        console.log(
          this._userName +
            "is going to unfollow " +
            (i + "/" + users.length + " " + userName).green
        );
        console.log("At time: " + (await helper.dateTime()));
        try {
          await this.unfollow(userName);
        } catch (e) {
          if (e.response) {
            if (e.response.status == 404) {
              console.log("Account does not exist or change the userName");
            } else {
              console.log(e);
              console.log(
                this.userName + " Account not unfollowed: " + userName
              );
            }
          } else {
            console.log(e);
            console.log(this.userName + " Account not unfollowed: " + userName);
          }
        } finally {
          //timeout
          await helper.sleepRandom(MIN_TIME, MAX_TIME);
          i++;
          pos++;
        }
      } else {
        //stop running
        users = users.slice(pos, users.length);
        break;
      }
    }
  }

  async getUsers(QUERY_HASH, userName, quantity) {
    let nextCursor = "";
    const uri_history = this._uri + "/usersHistory.json";
    //Last time searched for that user
    //If we are looking for ower users, it will not save the history
    let userHistory = {};
    try {
      userHistory = await helper.readJson(uri_history);
      nextCursor = userHistory[userName].nextCursor;
    } catch (e) {
      await helper.writeJson(userHistory, uri_history);
    }
    let users = [];

    const userId = userName ? await this.getUserId(userName) : this._userId;
    let isNextPage = true;

    const isFollower =
      QUERY_HASH == "c76146de99bb02f6415203be841dd25a" ? true : false; //true = follower
    while (isNextPage && users.length <= quantity) {
      let query_variables =
        '{"id": ' +
        userId +
        ',"include_reel":true,"fetch_mutual":false,"first":50,"after":"' +
        nextCursor +
        '"}';
      let variables = encodeURIComponent(query_variables);
      let URL =
        "https://www.instagram.com/graphql/query/?query_hash=" +
        QUERY_HASH +
        "&variables=" +
        variables;
      helper.sleep(1200);
      let response = await this.parseData(URL, isFollower);

      users = [...users, ...response.users];

      nextCursor = response.nextCursor;
      isNextPage = nextCursor ? true : false;
    }
    nextCursor = nextCursor ? nextCursor : "";
    const userType = isFollower ? "followers" : "following";
    userHistory[userName] = { nextCursor: nextCursor, userType: users };
    helper.writeJson(userHistory, uri_history);
    return users.slice(0, quantity);
  }

  async getUserFollowing(userName, i) {
    const quantity = i ? i : default_quantity;
    const QUERY_HASH = "d04b0a864b4b54837c0d870b0e77e076"; //Following
    return await this.getUsers(QUERY_HASH, userName, quantity);
  }

  async getUserFollowers(userName, i) {
    const quantity = i ? i : default_quantity;
    const QUERY_HASH = "c76146de99bb02f6415203be841dd25a"; //Followers
    return await this.getUsers(QUERY_HASH, userName, quantity);
  }

  async getUserGarcas(userName, WHITELIST) {
    try {
      const data_uri = this._uri + "/whiteList.json";
      const whiteList =
        fs.existsSync(data_uri) && !WHITELIST
          ? await helper.readJson(data_uri)
          : WHITELIST;

      const followers = await this.getUserFollowers(userName);
      const following = await this.getUserFollowing(userName);
      //No include following in followers
      const users = following.filter(i => !followers.includes(i));

      const garcas = whiteList
        ? users.filter(i => !whiteList.includes(i))
        : users;
      return garcas;
    } catch (e) {
      console.log(e);
    }
  }

  async getFollowing(i) {
    const following = await this.getUserFollowing(this._userName, i);
    helper.writeJson(following, this._uri + "/following.json");
    return following;
  }

  async getFollowers(i) {
    const followers = await this.getUserFollowers(this._userName, i);
    helper.writeJson(followers, this._uri + "/followers.json");
    return followers;
  }

  async parseData(URL, isFollower) {
    let nextCursor = false;

    const response = await this.getData(URL);

    const data = isFollower
      ? response.data.data.user.edge_followed_by
      : response.data.data.user.edge_follow;
    const isNextPage = data.page_info.has_next_page;
    if (isNextPage) {
      nextCursor = data.page_info.end_cursor;
    }

    const array = data.edges;
    const users = array.map(i => i.node.username);
    return {
      users,
      nextCursor
    };
  }

  async postData(URL) {
    const HEADERS = {
      Accept: "*/*",
      Cookie: "sessionid=" + this._sessionid.value,
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "X-CSRFToken": this._csrftoken.value,
      "X-IG-App-ID": "936619743392459",
      "X-IG-WWW-Claim": "hmac.AR1P_tpI9zVx0XXJmn4F6-m5s9I_Uo042hIDFnbA5jIHurbG",
      "X-Requested-With": "XMLHttpRequest",
      "X-Instagram-AJAX": "nosirve",
      Connection: "close",
      Referer: "https://www.instagram.com/",
      Host: "www.instagram.com"
    };
    const options = {
      url: URL,
      method: "POST",
      headers: HEADERS
    };
    try {
      const response = await axios(options);
      return response;
    } catch (e) {
      if (e.response.status == 429) {
        console.log(e.response.data);
        console.log(
          (
            "Error 429, TOO MANY REQUEST, waiting " +
            errTime[429] / (3600 * 1000) +
            " hours and try it again"
          ).red
        );
        await helper.sleep(errTime[429]);
        await this.init();
        let res = await this.getData(URL);
        return res;
      } else if (e.response.status == 400) {
        console.log(e.response.data);
        console.log(
          (
            "Error 400, BAD REQUEST, waiting " +
            errTime[400] / (3600 * 1000) +
            " hours and try it again"
          ).red
        );
        await helper.sleep(errTime[400]);
        await this.init();
        let res = await this.getData(URL);
        return res;
      } else {
        throw e;
      }
    }
  }

  async getData(URL) {
    const HEADERS = {
      Accept: "*/*",
      Cookie: "sessionid=" + this._sessionid.value,
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "X-CSRFToken": this._csrftoken.value,
      "X-IG-App-ID": "936619743392459",
      "X-IG-WWW-Claim": "hmac.AR219pFWs-qIxhqhubZT5W5dTLRV0tSHDzJDtK0-cg2BwLdF",
      "X-Requested-With": "XMLHttpRequest",
      Connection: "close",
      Referer: "https://www.instagram.com/",
      Host: "www.instagram.com"
    };
    const options = {
      url: URL,
      method: "GET",
      headers: HEADERS
    };
    try {
      const response = await axios(options);
      return response;
    } catch (e) {
      if (e.response.status == 429) {
        console.log(e.response.data);
        console.log(
          (
            "Error 429, TOO MANY REQUEST, waiting " +
            errTime[429] / (3600 * 1000) +
            " hours and try it again"
          ).red
        );
        await helper.sleep(errTime[429]);
        await this.init();
        let res = await this.getData(URL);
        return res;
      } else if (e.response.status == 400) {
        console.log(e.response.data);
        console.log(
          (
            "Error 400, BAD REQUEST, waiting " +
            errTime[400] / (3600 * 1000) +
            " hours and try it again"
          ).red
        );
        await helper.sleep(errTime[400]);
        await this.init();
        let res = await this.getData(URL);
        return res;
      } else {
        throw e;
      }
    }
  }

  async getGarcas(WHITELIST) {
    //A garca is who you follow but it didn't follow you back
    return this.getUserGarcas(this._userName, WHITELIST);
  }

  async getFans() {
    //A garca is who you follow but it didn't follow you back

    const { followers, following } = await this.getAccountData();

    const users = followers.filter(i => !following.includes(i));

    return users;
  }

  async getMutuals() {
    const { followers, following } = await this.getAccountData();

    const users = followers.filter(i => following.includes(i));

    return users;
  }

  async getUserId(userName) {
    if (userName) {
      const URL = "https://www.instagram.com/" + userName + "/?__a=1";
      const response = await this.getData(URL);
      return response.data.graphql.user.id;
    } else {
      console.log("No username detected");
    }
  }

  async getAccountData() {
    const followers = await this.getFollowers();
    const following = await this.getFollowing();

    return {
      followers,
      following
    };
  }
}

exports.Account = Account;
