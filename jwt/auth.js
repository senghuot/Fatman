var jwt = require('jwt-simple');
var User = require('./../models/user');
var secret = require('./../config/secret');

var auth = {
	// middleware to log user
	login: function(req, res){
		var email = req.body.email || '';
		var password = req.body.password || '';

		// check if user enter credentials
		if (email === '' || password === ''){
			console.log('user or password is empty');
			res.status(401);
			res.json({
				'status': 401,
				'message': 'Invalid Credentails	'
			});

			return;
		}

		// Fire a query to your DB and check if the credentials are valid
		User.findOne({email: email}, function(err, user){
			if (err){
				res.status(500);
				res.json({
					'status': 500,
					'message': 'Internal error'
				});
				return;
			}

			if (!user || !user.validatePassword(password)){
				res.status(401);
				res.json({
					'status': 401,
					'message': 'Invalid credentials'
				});
				return;
			}

			res.json(genToken(user));
		});
	},

	// middleware to signup
	signup: function(req, res){

		var mapErrors = validateInput(req);

		if (!mapErrors){ // validation success
			
			var user = new User();
			user.fname = req.body.fname;
			user.lname = req.body.lname;
			user.email = req.body.email;
			user.password = User.hashPassword(req.body.password);

			user.save(function(err){
				if (err){
					res.status(500);
					res.json({
						'status': 500,
						'message': 'Internal error'
					});
					return;
				}

				res.json({
					'status': 200,
					'message': 'Signup successfully!'
				});
			});
		}else{ // validation failed
			console.log(mapErrors);
			res.status(400);
			res.json({
				'status': 400,
				'message': 'Inputs Invalid!',
				'invalid': mapErrors
			});
		}
	},

	// middleware check if you authenicated
	auth: function(req, res, next){
		// When performing a cross domain request, you will recieve
	  	// a preflighted request first. This is to check if our the app
	  	// is safe. 
	 
	  	// We skip the token outh for [OPTIONS] requests.
	  	// if(req.method == 'OPTIONS') next();	

	  	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || (req.headers['x-access-token']);
	  	var key = (req.body && req.body.key) || (req.query && req.query.x_key) || (req.headers['x-key']);

	  	if (token){
	  		try{
	  			var decoded = jwt.decode(token, secret());

	  			if (decoded.exp <= Date.now()){
	  				res.status(401);
	  				res.json({
	  					'status': 401,
	  					'message': 'Token Expired'
	  				});
	  				return;
	  			}

	  			User.findOne({_id: decoded.iss}, function(err, user){
	  				if (err){
	  					res.status(500);
	  					res.json({
	  						'status': 500,
	  						'message': 'Internal Error'
	  					});
	  					return;
	  				}

	  				if (!user){
	  					res.status(401);
	  					res.json({
	  						'status': 401,
	  						'message': 'Invalid User'
	  					});
	  					return;
	  				}

	  				next();
	  			});
	  		}catch(err){
	  			res.status(500);
	  			res.json({
	  				'status': 500,
	  				'message': 'Oops something went wrong',
	  				'error': err
	  			});
	  		}
	  	}else{
	  		res.status(401);
	  		res.json({
	  			'status': 401,
	  			'message': 'Invalid Token or Key'
	  		});
	  		return;
	  	}
	},

	user: function(req, res, next){
		var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || (req.headers['x-access-token']);
	  	var key = (req.body && req.body.key) || (req.query && req.query.x_key) || (req.headers['x-key']);	

	  	try{
	  		var decoded = jwt.decode(token, secret());

	  		if (decoded.iss != req.params.id){
	  			res.status(403).json({
	  				'status': 403,
	  				'message': 'Forbbiden Access'
	  			});
	  			return;
	  		}
	  		
	  		next();
	  	}catch(err){
	  		res.status(500);
  			res.json({
  				'status': 500,
  				'message': 'Oops something went wrong!!!!',
  				'error': err
  			});	
	  	}
	}
}

function genToken(user){
	var expires = expiresIn(30); // exipired in 30 minutes
	var token = jwt.encode({
			exp: expires,
			iss: user._id
		}, secret());

	user._id = '';
	user.password = '';
	user.posts = [];

	return {
		token: token,
		expires: expires,
		user: user
	}
}

function expiresIn(minutes){
	var dateObj = new Date();
	return dateObj.getTime() + minutes*60000;
}

function validateInput(req){
	//validate input
	req.assert('fname', 'First Name must contains only characters').isAlpha();
	req.assert('fname', 'First Name is required').notEmpty();

	req.assert('lname', 'Last Name must contains only characters').isAlpha();
	req.assert('lname', 'Last Name is required').notEmpty();

	req.assert('email', 'Email is not valid email address').isEmail();
	req.assert('email', 'Email is required').notEmpty();
	
	req.assert('password', 'Password must be between 6 and 20').len(6, 20);
	req.assert('password', 'Password is required').notEmpty();
	
	// uncomment to have superior password combination
	// req.assert('password', 'Password must contain at least one number').matches('(?=.*\\d)');
	// req.assert('password', 'Password must contain at least one lowercase character').matches('(?=.*[a-z])');
	// req.assert('password', 'Password must contain at least one uppercase character').matches('(?=.*[A-Z])');
	// req.assert('password', 'Password must contain at least one special character [@ # $ %]').matches('(?=.*[@#$%])');
	
	var mapErrors = req.validationErrors(true);

	return mapErrors;
}

module.exports = auth;