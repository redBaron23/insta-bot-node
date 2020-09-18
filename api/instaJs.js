//
//Farm famous option in data/user/config (ON/OFF)
const path = require("path");
const fs = require("fs");

const colors = require("colors");
const appDir = path.dirname(require.main.filename);

const helper = require(appDir + "/api/helper");

const PATO_GARCAS_URI = appDir + "/api/data/pato.toledo-garcas.json";
const FAMOUS_URI = appDir + "/api/data/accountFamous.json";

const accountHelper = require(appDir + "/api/accountHelper");

const _username = "redbaron396";
const _password = "SEGa1122";
let _account = new accountHelper.Account(_username, _password);
//_account.init();

const bounces = 10000;

async function logIn(USERNAME, PASSWORD) {
  //Login return cookies
  let response;
  try {
    let account = new accountHelper.Account(USERNAME, PASSWORD);
    await account.init();

    response = {
      data: {
        cookies: {
          csrftoken: account.csrftoken,
          sessionid: account.sessionid,
          shbid: account.shbid
        },
        userId: account.userId,
        userName: account.userName
      },
      status: 200
    };
  } catch (e) {
    console.log("ACA PAPER", e);
    let message;
    let errCode = e;
    if (e === 401) {
      message = "Wrong username or password";
    } else {
      message = "unknown error";
    }
    response = {
      status: errCode,
      data: message
    };
  } finally {
    return response;
  }
}

async function farmFamous(USERNAME, PASSWORD) {
  let rawdata = fs.readFileSync(FAMOUS_URI);
  const ACCOUNTS_FAMOUS = JSON.parse(rawdata);
  let _status;
  try {
    //let garcas = await accountHelper.getGarcas('pato.toledo',patoWhitelist)
    let response = {};
    let account = new accountHelper.Account(USERNAME, PASSWORD);
    await account.init();
    //FamousFarm
    console.log("Inicio bien");
    bounceAccounts(account, bounces, ACCOUNTS_FAMOUS);
    _status = "Farm famous started";
  } catch (e) {
    console.log(e);
    _statuis = "Hubo un error";
  }
  return _status;
}

async function followUserFollowers(USERNAME, PASSWORD) {
  let _status;
  try {
    let response = {};
    let account = new accountHelper.Account(USERNAME, PASSWORD);
    await account.init();
    const userName = "laplata.ciudad";
    // ratio = following/followers
    const ratio = 0.5;
    followAll(account, userName, ratio);
    _status = "Follow user Followers started";
  } catch (e) {
    console.log(e);
    _status = "Hubo un error";
    console.log("Too many request");
  }
  return _status;
}
async function unfollowSession(USERNAME, PASSWORD) {
  let _response;
  try {
    let account = new accountHelper.Account(USERNAME, PASSWORD);
    await account.init();

    let garcas = await _account.getUserGarcas(USERNAME);

    const session = await account.sessionFollowed();

    const sessioners = [...garcas, ...session];
    console.log(sessioners);
    console.log(
      ("Unfollowing: " + sessioners.length + " session followeds").green
    );
    unfollowAccounts(account, sessioners);

    _response = "Unfollow session followed started";
  } catch (e) {
    _response = "Hubo un error";
    console.log("Error at unfollow session");
  }
  return _response;
}
async function unfollowGarcas(USERNAME, PASSWORD) {
  let _response;
  try {
    let account = new accountHelper.Account(USERNAME, PASSWORD);
    await account.init();

    const garcas = await account.getGarcas();
    console.log(("Unfollowing: " + garcas.length + " garcas").green);
    unfollowAccounts(account, garcas);

    _response = "Unfollow garcas started";
  } catch (e) {
    _response = "Hubo un error";
    console.log("Error at unfollow garcas");
  }
  return _response;
}

async function followAll(account, userName, ratio) {
  // ratio = following/followers
  const MIN_TIME = 300000; //5min
  const MAX_TIME = 1200000; //20min

  const rSize = 500; //Number of users per request (lower better to don't get a ban)
  const [totalFollowers, totalFollowing] = await _account.countFollows(
    userName
  );
  const times = Math.trunc(totalFollowers / rSize) + 1;
  console.log(
    "Going to follow ~" +
      String(totalFollowers).red +
      " from " +
      userName.green +
      " in " +
      String(times).blue +
      " times"
  );

  for (i = 0; i < times; i++) {
    console.log(String(i + "/" + times).red);
    console.log("At time: " + (await helper.dateTime()));

    let followers = await account.getUserFollowers(userName, rSize);

    //Just follow users
    await followAccounts(account, followers, ratio);

    //timeout
    await helper.sleepRandom(MIN_TIME, MAX_TIME);
  }
}
async function isViable(userName, ratio) {
  let response;
  const realRatio = ratio ? ratio : 0.23;
  try {
    const [followers, following] = await _account.countFollows(userName);
    const currentRatio = following / followers;
    response = currentRatio >= realRatio;
  } catch (e) {
    console.log(e);
    console.log("Error found -> viable");
    response = true;
  } finally {
    return response;
  }
}
async function bounceAccounts(account, bounces, accounts) {
  const MIN_TIME = 300000; //5min
  const MAX_TIME = 1200000; //20min
  let timeBounce = 0;
  let timeBetween = 0;
  let used = 0;

  for (i = 0; i < bounces; i++) {
    console.log("Bounce number: " + colors.red(i));
    //Follow all accounts
    await followAccounts(account, accounts);

    console.log("At time: " + (await helper.dateTime()));

    await helper.sleepRandom(MIN_TIME, MAX_TIME);
    console.log("Termine_______");
    //Unfollow all accounts
    await unfollowAccounts(account, accounts);
    await helper.sleepRandom(MIN_TIME, MAX_TIME);
  }
}

async function unfollowAccounts(account, accounts) {
  const MIN_TIME = 300000 * 0.6; //5min
  const MAX_TIME = 420005 * 0.6; //7min
  const QUERYs = 20;
  const QUERY_MIN_TIME = 20 * 60 * 1000;
  const QUERY_MAX_TIME = 35 * 60 * 1000;

  let timeout = 0;
  let i = 1;
  console.log("Unfollowing: " + accounts.length);
  const following = await _account.getUserFollowing(account.userName);
  for (let userName of accounts) {
    if (!userName) {
      console.log("Vacio en la posicion" + i);
    }
    if (!(i % QUERYs) && i >= QUERYs) {
      //Sleep after 20 querys
      console.log(QUERYs + " querys pasadas, a dormir ".yellow);
      await helper.sleepRandom(QUERY_MIN_TIME, QUERY_MAX_TIME);
    }
    console.log(
      "Unfollowing: " + (i + "/" + accounts.length + " " + userName).green
    );
    console.log("At time: " + (await helper.dateTime()));
    try {
      if (following.includes(userName)) {
        await account.unfollow(userName);
      } else {
        console.log("Not followed previously");
        account.removeUserSession(userName);
      }
    } catch (e) {
      if (e.response) {
        if (e.response.status == 404) {
          console.log("Account does not exist or change the userName");
        } else {
          console.log(e);
        }
      } else {
        console.log(e);
        console.log("Account not unfollowed");
      }
    } finally {
      //timeout
      await helper.sleepRandom(MIN_TIME, MAX_TIME);
      i++;
    }
  }
}
async function followAccounts(account, accounts, ratio) {
  const MIN_TIME = 300000 * 0.4; //5min
  const MAX_TIME = 420005 * 0.4; //7min
  const QUERYs = 20;
  const QUERY_MIN_TIME = 10 * 60 * 1000;
  const QUERY_MAX_TIME = 30 * 60 * 1000;

  let timeout = 0;
  let i = 1;
  console.log("Following: " + accounts.length);
  for (let userName of accounts) {
    if (!userName) {
      console.log("Vacio en la posicion" + i);
    }
    if (!(i % QUERYs) && i >= QUERYs) {
      //Sleep after 20 querys
      console.log(QUERYs + " querys pasadas, a dormir ".yellow);
      await helper.sleepRandom(QUERY_MIN_TIME, QUERY_MAX_TIME);
    }
    console.log(
      "Following: " + (i + "/" + accounts.length + " " + userName).green
    );
    console.log("At time: " + (await helper.dateTime()));
    try {
      if (!ratio || (await isViable(userName, ratio))) {
        console.log(String("Going to follow " + userName).green);
        await account.follow(userName);
      }
    } catch (e) {
      console.log(e);
      console.log("Account not followed");
    } finally {
      //timeout
      await helper.sleepRandom(MIN_TIME, MAX_TIME);
      i++;
    }
  }
}

exports.logIn = logIn;
exports.unfollowSession = unfollowSession;
exports.unfollowGarcas = unfollowGarcas;
exports.farmFamous = farmFamous;
exports.followUserFollowers = followUserFollowers;
//exports.start = start;
