var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');

// CSRF Protection:
var cookieParser = require('cookie-parser')
var csrf = require('csurf')

var app = express();

app.use(session({secret: 'secret!', saveUninitialized: true, resave: false, cookie: {maxAge: 3*24*60*60*1000}}));
app.use(bodyParser.urlencoded({extended: false}));

// CSRF Protection:
app.use(cookieParser());
app.use(csrf({cookie: true}));

app.post('/money/transfer', function(req, res) {
  if (req.session.username) {
    var msg = 'Money transfer from account: ' + req.session.username + ', to account: ' + req.body.account + ', amount: ' + req.body.amount;
  } else {
    var msg = 'Could not transfer money: You must be logged in';
  }
  console.log(msg);
  res.send(msg);
});

app.get('/', function(req, res) {
  var output = '<h1>Welcome to Very Real Bank</h1>';
  if (req.session.username !== undefined) {
    output += 'You are logged in as "' + req.session.username + '"';
  } else {
    output += 'You are not logged in. <a href="/login">Log in now</a>.';
  }
  output += '<br/><br/>Current time: ' + new Date();
  res.send(output);
});

app.get('/login', function(req, res) {
  output  = '<h1>Please log in</h1>';
  output += '<form method="POST" action="/login">';
  output += '<input type="hidden" name="_csrf" value="' + (req.csrfToken ? req.csrfToken() : '')+ '"/>';
  output += 'Username:<br/><input type="text" name="username"/><br/>';
  output += 'Password:<br/><input type="password" name="password"><br/>';
  output += '<input type="submit" value="Log in" />';
  output += '</form>';
  res.send(output);
});

app.post('/login', function(req, res) {
  req.session.username = req.body.username;
  res.redirect('/');
});

var options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt'),
  requestCert: false,
  rejectUnauthorized: false
}

var server = https.createServer(options, app).listen(443, function(){
  console.log('This is a totally real bank web site!');
});
