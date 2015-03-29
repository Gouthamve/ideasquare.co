var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash    = require('connect-flash');
var mongoose = require('mongoose');
var db = require('./config/database.js');

mongoose.connect(db.url);

var routes = require('./routes/index');

var GitHubStrategy = require('passport-github2').Strategy;
var auth = require('./config/auth.js');
var User = require('./models/user.js');

//  ============== Passport ========  //

passport.serializeUser(function(profile, done) {
    done(null, profile);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findOne({id: id}, function(err, user) {
        done(err, user);
    });
});

passport.use(new GitHubStrategy({
  clientID: auth.clientID,
  clientSecret: auth.clientSecret,
  callbackURL: "http://localhost:3000/auth/github/callback"
},

  function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({'id': profile.id}, function(err, user) {
        if(err)
          return done(err)
        if(user){
          app.use(function(req, res, next) {
            req.session.passport.user = user;
            next();
          });
          return done(null, user);
        } else {
          var newUser = new User();
          newUser.id = profile.id;
          newUser.name = profile.displayName;
          newUser.token = token;
          newUser.save(function(err) {
            if(err)
              throw err;
            req.session.user = newUser;
            app.use(function(req, res, next) {
              req.session.user = newUser;
              next();
            });
            return done(null, newUser);
          });
        }
      });
    });
  }
));

//  =================================  //


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// required for passport
app.use(session({secret: 'ilovescotchscotchyscotchscotch', resave: false,
    saveUninitialized: false })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use('/', routes);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
