var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');

var User = require('./../models/user')

/* GET home page. */
router.get('/:password', function(req, res) {

	bcrypt.genSalt(10, function(err, salt){
		bcrypt.hash(req.params.password, salt, function(err, hash){
			var user = User({
				fname: 'test',
				lname: 'test',
				email: 'test@test.com',
				password: hash
			});

			user.save(function(err){
				if (err)
					console.log(err);
				else
					console.log('successfully added!');
			});
		});
	});

});

router.get('/check/:password', function(req, res){
	User.findOne({email: 'test@test.com'}, function(err, user){
		bcrypt.compare(req.params.password, user.password, function(err, result){
			if (result){
				res.send('true');
			}else{
				res.send('false');
			}
		});
	});
});

module.exports = router;