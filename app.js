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

app.route('/login')
  .get(async function(req, res) {
    res.send("No paper");
  })
  .post(async function(req, res) {
    
    let result; 
    const username = req.body.username
    const password = req.body.password
    result = (username &&  password) ? (await instaJs.start(username,password)) : "No username or password provided"
    console.log(result)
    res.send(result);
  })
  .put(function(req, res) {
    res.send('Update the book');
  });




app.listen(6666, function (){
	console.log("Listen on 6666")
});