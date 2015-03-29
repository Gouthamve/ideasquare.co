var express = require('express');
var router = express.Router();
var passport = require('passport');
var github = require('octonode');
var bp = require('body-parser');
var urlencodedParser = bp.urlencoded({ extended: false })


/* GET home page. */
router.get('/', function(req, res, next) {
	req.session.save();
  res.render('index');
});

router.get('/issue', isLoggedIn, function(req, res, next) {
  var sessId = req.sessionID;
  console.log(sessId);
  req.session.reload( function (err) {
		var session = JSON.parse(req.sessionStore.sessions[sessId]);
		console.log(session.passport);
		req.session.save();
  	res.render('issue');    
  });
});

router.post('/', isLoggedIn, urlencodedParser, function(req,res) { 
	console.log(req.sessionID);

  req.session.reload( function (err) {
		var user = JSON.parse(req.sessionStore.sessions[req.sessionID]).passport.user;
		console.log(user);  
		var client = github.client(user.token);
		var ghrepo      = client.repo('Gouthamve/reaction-test');
		ghrepo.issue({
		  "title": req.body.title,
		  "body": req.body.description
		}, function(err, res) {
			if(err)
				console.log(err);
			console.log(res);
		}); //issue
  });

	res.redirect('/issue');
});

router.get('/auth/github', passport.authenticate('github', {scope: ['user:email', 'repo']}));

router.get('/auth/github/callback', 
	passport.authenticate('github', {
    failureRedirect : '/',
    successRedirect: '/issue'
  }));

function isLoggedIn(req, res, next) {
	req.session.reload( function (err) {
		// if user is authenticated in the session, carry on
	  var sessId = req.sessionID;
	  var sessions = req.sessionStore.sessions; 
	  if (sessions[sessId])
	    return next();
	  // if they aren't redirect them to the home page
  	res.redirect('/');
  });  
}

module.exports = router;

