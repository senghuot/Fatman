var express = require('express');
var router = express.Router();

var User = require('./../models/user')

var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'HOME' });
});

/* GET signup page. */
router.get('/signup', function(req, res){
	
	res.render('signup', 
		{
			title: 'SIGN UP',
			errors: req.flash('errors'),
			oldInput: req.flash('oldInput'),
			message: req.flash('message')
		}
	);
});

/* POST signup page. */
router.post('/signup', function(req, res){
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
		
		// hash password with bcrypt module
		var salt = bcrypt.genSaltSync(10);
		var passwordHash = bcrypt.hashSync(req.body.password, salt);

		var user = new User();
		user.email = req.body.email;
		user.fname = req.body.fname;
		user.lname = req.body.lname;
		user.password = passwordHash;

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

