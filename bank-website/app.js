// vim: ts=2:sw=2
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');

// CSRF Protection:
//var cookieParser = require('cookie-parser')
//var csrf = require('csurf')

var app = express();

app.use(session({secret: 'secret!', saveUninitialized: true, resave: false, cookie: {maxAge: 7*24*60*60*1000}}));
app.use(bodyParser.urlencoded({extended: false}));

// CSRF Protection:
//app.use(cookieParser());
//app.use(csrf({cookie: true}));

app.post('/money/transfer', function(req, res) {
  // This is a pretend money transfer endpoint
  var msg;
  if (req.session.username) {
    msg = 'Success!';
    msg += ' Money transferred from account "' + req.session.username + '"';
    msg += ' to account ' + req.body.account;
    msg += ', amount: ' + req.body.amount;
  } else {
    msg = 'Could not transfer money: You must be logged in';
  }
  res.send(msg);
});

app.get('/', function(req, res) {
  var output = '<h1>Welcome to Very Real Bank</h1>';
  if (req.session.username !== undefined) {
    output += 'You are logged in as "' + req.session.username + '"<br/><br/>';
    output += '<h3>Transfer money:</h3>';
    output += '<form method="POST" action="/money/transfer">';
    output += '<input type="hidden" name="_csrf" value="' + (req.csrfToken ? req.csrfToken() : '')+ '"/>';
    output += 'To account:<br/><input type="text" name="account" value=""/><br/>';
    output += 'Amount:<br/><input type="text" name="amount" value=""/><br/>';
    output += '<input type="submit" name="submit" value="Transfer"/><br/>';
    output += '</form>';
  } else {
    output += 'You are not logged in. <a href="/login">Log in now</a>.';
  }
  output += '<br/><br/><i>Current time: ' + new Date() + '</i>';
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



// Server config:
var options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt'),
  requestCert: false,
  rejectUnauthorized: false
}

var server = https.createServer(options, app).listen(443, function(){
  console.log('This is a totally real bank web site!');
});
