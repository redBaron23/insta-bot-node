var express = require('express')

var path = require('path')

var appDir = path.dirname(require.main.filename);



const instaJs = require(appDir+'/api/instaJs.js')

var bodyParser = require('body-parser')
var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.route('/followUserFollowers')
  .get(async function(req, res) {
    res.send("No paper");
  })
  .post(async function(req, res) {
    
    let result; 
    const username = req.body.username
    const password = req.body.password
    result = (username &&  password) ? (await instaJs.followUserFollowers(username,password)) : "No username or password provided"
    console.log(result)
    res.send(result);
  })





app.route('/farmFamous')
  .get(async function(req, res) {
    res.send("No paper");
  })
  .post(async function(req, res) {
    
    let result; 
    const username = req.body.username
    const password = req.body.password
    result = (username &&  password) ? (await instaJs.farmFamous(username,password)) : "No username or password provided"
    console.log(result)
    res.send(result);
  })
  .put(function(req, res) {
    res.send('Update the book');
  });




app.listen(1111, function (){
	console.log("Listen on 1111")
});
