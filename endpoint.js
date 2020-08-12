let express = require("express");

let path = require("path");

let cors = require("cors");
let appDir = path.dirname(require.main.filename);

const instaJs = require(appDir + "/api/instaJs.js");

let bodyParser = require("body-parser");
let app = express();

//Anti cors
app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app
  .route("/login")
  .get(async function(req, res) {
    res.send("Nice try paper");
  })
  .post(async function(req, res) {
    let result;
    let json;
    const username = req.body.username;
    const password = req.body.password;
    try {
      json =
        username && password
          ? await instaJs.logIn(username, password)
          : "No username or password provided";
    } catch (e) {
      json = {
        status: -1,
        data: "Unkown error"
      };
    } finally {
      console.log(result);
      result = JSON.stringify(json);
      res.send(result);
    }
  })
  .put(function(req, res) {
    res.send("Update the book");
  });

app.listen(1111, function() {
  console.log("Listen on 1111");
});
