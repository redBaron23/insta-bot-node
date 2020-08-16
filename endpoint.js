let express = require("express");

let path = require("path");

let cors = require("cors");
let appDir = path.dirname(require.main.filename);

const instaJs = require(appDir + "/api/instaJs.js");
const Account = require("./api/accountHelper").Account;
let bodyParser = require("body-parser");
let app = express();

//Anti cors
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.route("/follow").post((req, res) => {
  let result;
  let json;
  try {
    const data = req.body.data;
    const followUser = req.body.userName;
    let account = new Account(data.userName, "No pass");
    account.load(data);
    account.follow(followUser);
    json = {
      data: "ok",
      status: 200
    };
  } catch (e) {
    console.log(e);
    json = {
      data: "error",
      status: -1
    };
  } finally {
    result = JSON.stringify(json);
    console.log(result);
    res.send(result);
  }
});
app.route("/unfollow").post((req, res) => {
  let result;
  let json;
  try {
    const data = req.body.data;
    const unfollowUser = req.body.userName;
    let account = new Account(data.userName, "No pass");
    account.load(data);
    account.unfollow(unfollowUser);
    json = {
      data: "ok",
      status: 200
    };
  } catch (e) {
    console.log(e);
    json = {
      data: "error",
      status: -1
    };
  } finally {
    result = JSON.stringify(json);
    console.log(result);
    res.send(result);
  }
});

app.route("/garcas").post((req, res) => {
  let result;
  let json = {};
  try {
    const data = req.body.data;
    const whiteList = req.body.whiteList;
    let account = new Account(data.userName, "No pass");
    account.load(data);
    account.getGarcas(whiteList).then(garcas => {
      json.status = 200;
      json.garcas = garcas;
      result = JSON.stringify(json);
      res.send(result);
    });
  } catch (e) {
    console.log(e);
    json = {
      data: "error",
      status: -1
    };
    result = JSON.stringify(json);
    console.log(result);
    res.send(result);
  }
});
app
  .route("/login")
  .get(async function(req, res) {
    res.send("Nice try paper");
  })
  .post(async function(req, res) {
    let result;
    let json;
    let noUserMessage = "Wrong username or password";
    const username = req.body.username;
    const password = req.body.password;
    try {
      json =
        username.length >= 6 && password.length >= 6
          ? await instaJs.logIn(username, password)
          : 401;
    } catch (e) {
      json = {
        status: -1,
        data: "Unkown error"
      };
    } finally {
      if (json === 401) {
        json = {
          data: noUserMessage,
          status: 401
        };
      }
      result = JSON.stringify(json);
      console.log(result);
      res.send(result);
    }
  })
  .put(function(req, res) {
    res.send("Update the book");
  });

app.listen(1111, function() {
  console.log("Listen on 1111");
});