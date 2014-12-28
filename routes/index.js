var express = require('express');
var router = express.Router();

var User = require('./../models/user')

var before = require('./../before');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { 
		title: 'HOME',
		home: 'active'
	});
});

/* GET about page. */
router.get('/about', function(req, res){
	res.render('about', {
		title: 'ABOUT',
		about: 'active'
	});
});

/* GET post page. */
router.get('/post', before.auth, function(req, res){
	res.render('post', {
		title: 'POST',
		post: 'active'
	});
});

/* GET signup page. */
router.get('/signup', before.guest, function(req, res){
	res.render('signup', 
		{
			title: 'Sign Up',
			csrfToken: req.csrfToken(),
			errors: req.flash('errors'),
			oldInput: req.flash('oldInput'),
			message: req.flash('message')
		}
	);
});

/* POST signup page. */
router.post('/signup', before.guest, function(req, res){
	// to trim input
	req.body.fname = req.body.fname.trim();

	// validate input
	req.assert('fname', 'First Name must contains only characters').isAlpha();
	req.assert('fname', 'First Name is required').notEmpty();

	req.assert('lname', 'Last Name must contains only characters').isAlpha();
	req.assert('lname', 'Last Name is required').notEmpty();

	req.assert('email', 'Email is required').notEmpty();
	req.assert('email', 'Email is not valid email address').isEmail();

	req.assert('confirmEmail', "Email is not matched").equals(req.body.email);

	
	req.assert('password', 'Password must be between 6 and 20').len(6, 20);
	// uncomment to have superior password combination
	// req.assert('password', 'Password must contain at least one number').matches('(?=.*\\d)');
	// req.assert('password', 'Password must contain at least one lowercase character').matches('(?=.*[a-z])');
	// req.assert('password', 'Password must contain at least one uppercase character').matches('(?=.*[A-Z])');
	// req.assert('password', 'Password must contain at least one special character [@ # $ %]').matches('(?=.*[@#$%])');
	req.assert('password', 'Password is required').notEmpty();

	req.assert('confirmPassword', 'Password is not matched').equals(req.body.password);


	var mapErrors = req.validationErrors(true);

	if (!mapErrors){	// validation success

		var user = new User();
		user.email = req.body.email;
		user.fname = req.body.fname;
		user.lname = req.body.lname;
		user.password = User.hashPassword(req.body.password);

		user.save(function(err){
			if (err){
				var message = 'Something went wrong';
				
				if (err.code === 11000){ // user already existed
					message = 'Email is taken. Please use different email!';
				}

				console.log(err);
				req.flash('message', message);
				req.flash('oldInput', req.body);
				res.redirect('/signup');
			}else{
				req.flash('message', 'You have successfully signed up');
				res.redirect('/signup');	
			}

		});

	}else{ // validation fails
		req.flash('errors', mapErrors);
		req.flash('oldInput', req.body);
		res.redirect('/signup');
	}
});

module.exports = router;

