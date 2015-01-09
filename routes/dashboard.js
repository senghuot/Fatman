var express = require('express');
var router = express.Router();

// model
var Post = require("./../models/post")
var User = require("./../models/user")

var before = require('./../before');

/* GET posts page */
router.get('/posts', before.auth ,function(req, res){
	Post.find({user: req.user._id}).populate("sub_category location user").sort({"post_date":-1})
	.exec(function(err, posts){
		res.render("dashboard/posts",{
			title: "POST",
			posts: posts,
			post: "active"
		});
	});
});

/* GET edit posts page */
router.get('/posts/:id', before.auth, function(req, res){
	var postId = req.params.id;

	Post.findOne({_id: postId}).populate("user").exec(function(err, post){
		if (err) return console.log(err);

		if (post.user.id == req.user.id)
			return res.json(post);	
		
		return res.send("not your post");
	});
});

/* GET profile page */
router.get('/profile', before.auth, function(req, res){
	res.render("dashboard/profile",{
		title: "PROFILE",
		profile: "active"
	});
});

/* GET edit profile page */
router.get('/profile/edit', before.auth, function(req, res){
	res.render("dashboard/editProfile",{
		title: "EDIT PROFILE",
		profile: "active",
		csrfToken: req.csrfToken(),
		errors: req.flash("errors"),
		oldInput: req.flash("oldInput"),
		message: req.flash('message')
	});
});

/* POST edit profile page */
router.post('/profile/edit', before.auth, function(req, res){
	// to trim input
	req.body.fname = req.body.fname.trim();
	req.body.lname = req.body.lname.trim();
	req.body.email = req.body.email.trim();

	// validate input
	req.assert('fname', 'First Name must contains only characters').isAlpha();
	req.assert('fname', 'First Name is required').notEmpty();

	req.assert('lname', 'Last Name must contains only characters').isAlpha();
	req.assert('lname', 'Last Name is required').notEmpty();

	req.assert('email', 'Email is not valid email address').isEmail();
	req.assert('email', 'Email is required').notEmpty();

	var mapErrors = req.validationErrors(true);

	if (!mapErrors){
		User.findOne({_id: req.user.id}, function(err, user){
			if (err) console.log(err);
			else{
				user.fname = req.body.fname;
				user.lname = req.body.lname;
				user.email = req.body.email;

				user.save(function(err){
					if (err){
						console.log(err);
						if (err.code == 11000){
							req.flash("message", user.email + " alreay existed!");
							req.flash("oldInput", req.body);
							res.redirect("/dashboard/profile/edit");
						}	
					} 
					else{
						res.redirect("/dashboard/profile");
					}
				});
			}
		});
	}else{
		console.log(mapErrors);
		req.flash("errors", mapErrors);
		req.flash("oldInput", req.body);
		res.redirect("/dashboard/profile/edit");
	}
});

module.exports = router;