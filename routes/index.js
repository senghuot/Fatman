var express = require('express');
var router = express.Router();

var fs = require('fs');
var before = require('./../before');

// import models
var Post = require('./../models/post');
var User = require('./../models/user');
var Location = require('./../models/location');
var Category = require('./../models/category');
var Sub_Category = require("./../models/sub_category");

/* GET home page. */
router.get('/', function(req, res) {
	var subCat = Sub_Category.find().sort({'view': -1}).limit(6);

	subCat.exec(function(err, subCategories){
			
		if (err)
			console.log(err);
		else {
			Post.find().sort({"post_date":-1}).populate("user location").limit(20)
			.exec(function(err, posts){
				if (err) console.log(err);
				else{
					res.render('index', { 
						title: 'HOME',
						home: 'active',
						message: req.flash('message'),
						subCategories: subCategories,
						posts: posts
					});
				}
			});
		}
			
	});
});

/* GET about page. */
router.get('/development', function(req, res){
	res.render('development', {
		title: 'DEVELOPMENT',
		about: 'active'
	});
});

/* GET post page. */
router.get('/post', before.auth, function(req, res){
	
	
	var scripts = [];	
	scripts.push("/js/angular/post.js");

	res.render('post', {
		title: 'POST',
		post: 'active',
		csrfToken: req.csrfToken(),
		errors: req.flash('errors'),
		oldInput: req.flash('oldInput'),
		message: req.flash('message'),
		scripts: scripts
	});
	
});

router.post('/posttest', function(req, res){
	console.log(req.body);
	res.send(req.body);
});

/* POST post page */
router.post('/post', function(req, res){
	// trim out the whitespaces
	var category = (req.body.category != undefined) ? req.body.category.trim() : '';
	var subCategory = (req.body.subCategory != undefined) ? req.body.subCategory.trim() : '';
	var title = (req.body.title != undefined) ? req.body.title.trim() : '';
	var condition = (req.body.title != undefined) ? req.body.condition.trim() : '';
	var details = (req.body.title != undefined) ? req.body.details.trim() : '';
	var price = (req.body.title != undefined) ? req.body.price.trim() : '';
	var location = (req.body.location != undefined) ? req.body.location.trim() : '';

	// assertions then create an error map object
	req.assert('category', 'Category is required').notEmpty();
	req.assert('subCategory', 'Sub Category is required').notEmpty();
	req.assert('title', 'Title is required').notEmpty();
	req.assert('condition', 'Condition is required').notEmpty();
	req.assert('details', 'Details is required').notEmpty();
	req.assert('price', 'Price is required').notEmpty();
	req.assert('location', 'Location is required').notEmpty();
	var mapErrors = req.validationErrors(true);

	// mapErrors exists then we know there are some errors to handle
	if (mapErrors) {
		req.flash('errors', mapErrors);
		req.flash('oldInput', req.body);
		res.redirect('/post');
	} else {
		// get expiration date
		var date = new Date();
		date.setDate(date.getDate() + 7);
		
		var post = new Post();
		post.title = title;
		post.description = details;
		post.sub_category = subCategory;
		post.expiration_date = date;
		post.price = price;
		post.condition = condition;
		post.location = location;
		post.user = req.user;

		// save it to database then save photos
		post.save( function(err) {
			if (err)
				console.log(err);
			else {
				// convert an object to an array
				var photos = [];
				if (Object.prototype.toString.call(req.files.photos) === '[object Array]')
					photos = req.files.photos;
				else
					photos.push(req.files.photos);

				// update all the photos
				for (var i = 0; i < photos.length; i++) {
					var data = fs.readFileSync(photos[i].path);

					// move the files from tmp to upload folders
			        var extension = photos[i].type;
			        var index = extension.lastIndexOf("/");
			        extension = extension.substring(index + 1);

					var relativePath = '/uploads/posts/' + post._id + '_' + i + '.' + extension;

					fs.writeFileSync("./public" + relativePath, data);
					post.pictures.push(relativePath);
				}

				post.save( function(err) {
					if (err) console.log(err);
					else{
						Location.findOne({_id: location}, function(err, locat){
							locat.posts.push(post);
							locat.save();
						});


						Sub_Category.findOne({_id: subCategory}, function(err, subCat){
							if (err) console.log(err);
							else{
								console.log(subCat);
								console.log(post);
								subCat.posts.push(post);
								subCat.save(function(err){
									if (err) console.log(err);
									else
										// pass post object
										res.redirect('/display/' + post.id);
								});
							}
						});	
					}
				});
			}
		});
	}
});

// GET display page.
router.get('/display/:post_id', function(req, res) {
	var post_id = req.params.post_id;
	Post.findOne({_id: post_id}).populate('location sub_category user').exec(function(err, post) {

		if (err)
			console.log(err);
		else {
			res.render('display',
				{
					title: 'Display',
					post: post
				});
		}
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
	req.body.fname = (req.body.fname != undefined) ? req.body.fname.trim() : '';

	// validate input
	req.assert('fname', 'First Name must contains only characters').isAlpha();
	req.assert('fname', 'First Name is required').notEmpty();

	req.assert('lname', 'Last Name must contains only characters').isAlpha();
	req.assert('lname', 'Last Name is required').notEmpty();

	req.assert('email', 'Email is not valid email address').isEmail();
	req.assert('email', 'Email is required').notEmpty();

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
			}else{	// sign up successfully
				req.flash('message', 'You have successfully signed up');
				res.redirect('/');	
			}

		});

	}else{ // validation fails
		console.log(mapErrors);
		req.flash('errors', mapErrors);
		req.flash('oldInput', req.body);
		res.redirect('/signup');
	}
});

/* GET about page. */
router.get('/search/', function(req, res){
	Post.find().populate('location sub_category user').exec(function(err, posts) {
		if (err)
			console.log(err);
		else {
			Category.find().populate('sub_categories').exec(function(err, categories){
				for (var i = 0; i < categories.length; i++){
					categories[i].sub_categories = categories[i].sub_categories.sort(function(a, b){
						if (a.type < b.type) return 1;
						if (a.type > b.type) return -1;
						return 0;
					});
				}
				
				res.render('search', {
					title: 'SEARCH',
					posts: posts,
					categories: categories
				});
			});
		}
	});
});

module.exports = router;