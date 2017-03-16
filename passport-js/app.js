var express = require('express');
var jwt = require('jwt-simple');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../mongo-dao');
var expires = 1800000;
var actual = new Date().getTime();


app.use(passport.initialize());
app.set('jwtTokenSecret', 'secret');

function findOne(userName, password, done) {

    User.findOne({ username: userName }, function (err, user) {

        console.log(user);
        if (err) return done(null, false, { message: 'Error.' });

        if (!user) return done(null, false, { message: 'Usuari no trobat' });

        if (password === user.password) {
            return done(null, { username: userName, password: password });
        } else {
            return done(null, false, { message: 'Contrasenya incorrecte' });
        }
    });

}

passport.use(new LocalStrategy(
  function(userid, password, done) {
    User.findOne({ username: userid }, function (err, user) {


      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, "Usuari no trobat");
      }
      if (password != user.password) {
        return done(null, "Contrasenya incorrecte");

      }

      var token = jwt.encode({
          iss: user,
          exp: actual + expires
      }, app.get('jwtTokenSecret'));

      var refresh_token = jwt.encode({
          token: token,
          exp: actual + (expires * 48)
      }, app.get('jwtTokenSecret'));

      return done(null, {state: 'OK',
        token});
    });
  }
));

passport.use(new BasicStrategy(
  function(userid, password, done) {
    User.findOne({ username: userid }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, "Usuari no trobat");
      }
      if (password != user.password) {
        return done(null, "Contrasenya incorrecte");

      }

      var token = jwt.encode({
          iss: user,
          exp: actual + expires
      }, app.get('jwtTokenSecret'));

      var refresh_token = jwt.encode({
          token: token,
          exp: actual + (expires * 48)
      }, app.get('jwtTokenSecret'));

      return done(null, {state: 'OK',
        token});
    });

  }
));

app.get('/token-basic', passport.authenticate('basic', { session: false }), function(req, res) {
    res.json(req.user);
});

app.get('/token-local', passport.authenticate('local', { session: false }), function(req, res) {
    res.json(req.user);
});

app.get('/verify-token',
function (req, res) {
  var decode;

  decode = jwt.decode(req.query.token,app.get('jwtTokenSecret'));

  //Ha expirat
  if(actual > req.exp){

    res.send("Ha expirat la teva sessió");

  } else {

    res.json(req.user);

  }

});

app.listen(3030, function () {
    console.log("Listening at port 3030");
});
