var express = require('express');
var router = express.Router();
var fs = require('fs');
var easyimage = require('easyimage');
var mongoose = require('mongoose');

// model
var Post = require("./../models/post");
var User = require("./../models/user");
var Location = require('./../models/location');
var Sub_Category = require('./../models/sub_category');
var Category = require('./../models/category');

var before = require('./../before');

/* Testing Delete picture */
router.get('/deletepicture/:postId', function(req, res){
	var postId = req.params.postId;
	// console.log(postId);
	Post.findOne({_id: postId}, function(err, post){
		if (err)
			return console.log(err);
		else
			if (post != null){
				console.log(post);
				res.render('dashboard/picture',{
					post: post,
					title: "delete image",
					csrfToken: req.csrfToken()
				});
			}
	});
});

/* GET posts page */
router.get('/posts', before.auth ,function(req, res){

	Post.find({user: req.user._id, status: 'active'}).populate("sub_category location user").sort({"post_date":-1})
	.exec(function(err, posts){
		res.render('dashboard/posts',{
			title: 'POST',
			posts: posts,
			post: 'active'
		});
	});
});

/* GET edit posts page */
router.get('/posts/edit/:id', before.auth, function(req, res){
	var postId = req.params.id;

	Post.findOne({_id: postId}).populate('user sub_category').exec(function(errPost, post){

		// setting up categories and sub categories
		Category.find().populate('sub_categories').exec(function(errCategories, categories) {

			// getting all the location
			Location.find(function(errLocation, locations) {
				// checking all the errors first
				if (errPost) return console.log(errPost);
				if (errCategories) return console.log(errCategories);

				if (post.user.id == req.user.id) {
					console.log(post);
					var scripts = [];	
					scripts.push("/js/angular/editPost.js");	

					res.render('dashboard/editPost', {
						errors: req.flash('errors'),
						message: req.flash('message'),
						title: 'POST',
						post: post,
						categories: categories,
						locations: locations,
						csrfToken: req.csrfToken(),
						oldInput: req.flash('oldInput'),
						scripts: scripts
					});
				} else {
					return res.send(post);
				}
			});
		});
	});
});

/*
POST edit posts page
*/
router.post('/posts/edit', before.auth, function(req, res) {
	// trim out the whitespaces
	var postID = (req.body.postID != undefined) ? req.body.postID.trim() : '';
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
		console.log(mapErrors);
		req.flash('errors', mapErrors);
		req.flash('oldInput', req.body);
		res.redirect('/dashboard/posts/edit/' + postID);
	} else {
		Post.findOne({_id: postID}, function(errPost, post) {
			if (errPost) console.log(err);
			else {
				post.sub_category = subCategory;
				post.title = title;
				post.condition = condition;
				post.description = details;
				post.price = price;
				post.location = location;

				post.save(function (errSave) {
					if (errSave) console.log(errSave);
					else{
						// convert an object to an array
						var photos = [];
						if (Object.prototype.toString.call(req.files.photos) === '[object Array]')
							photos = req.files.photos;
						else
							photos.push(req.files.photos);

						// get the last index of picture
						var lastPhotoIndex = 0;
						if (post.pictures.length > 0){
							var lastPhoto = post.pictures[post.pictures.length - 1];
							var beginIndex = lastPhoto.lastIndexOf("_");
							lastPhotoIndex = lastPhoto.substring(beginIndex + 1, beginIndex + 2);
							lastPhotoIndex++;
						}

						// update all the photos
						for (var i = 0; i < photos.length; i++) {
							console.log("inside update all photos: " + i);
							var data = fs.readFileSync(photos[i].path);

							// move the files from tmp to upload folders
					        var extension = photos[i].type;
					        var index = extension.lastIndexOf("/");
					        extension = extension.substring(index + 1);

					        var photoIndex = i + lastPhotoIndex;
							var relativePath = '/uploads/posts/' + post._id + '_' + photoIndex + '.' + extension;

							fs.writeFileSync("./public" + relativePath, data);
							post.pictures.push(relativePath);

							// small image
							var smallImagePath = "/uploads/posts/small/" + post._id + "_s_" + photoIndex + ".jpg";
							post.pictures_s.push(smallImagePath);
							easyimage.resize({
								src: photos[i].path,
								dst: "public" + smallImagePath,
								width: 300
							}).then(
								function(file){
									console.log("pictures_s is pushed.");
								},
								function(err){
									console.log(err);
								}
							);

							// large image
							var largeImagePath = "/uploads/posts/large/" + post._id + "_l_" + photoIndex + ".jpg";
							post.pictures_l.push(largeImagePath);
							easyimage.resize({
								src: photos[i].path,
								dst: "public" + largeImagePath,
								width: 800
							}).then(
								function(file){
									console.log("pictures_l is pushed.");
								},
								function(err){
									console.log(err);
								}
							);
						}

						post.save(function(err){
							if 
								(err) console.log(err);
							else
								res.redirect('/dashboard/posts');	
						});
						
					}
				});
			}
		});
	}
});

/* 
GET delete posts page 
Set post's status to delete; post won't show up on search page
*/
router.get('/posts/:id/delete', before.auth,function(req, res){
	var postId = req.params.id;

	Post.findOne({_id: postId}).populate("user").exec(function(err, post){
		if (err){
			console.log(err);	
			// handle error. eg: redirection to other pages...
			res.send("something went wrong!!!")
		} 

		// post not found
		if (post == null) return res.send("Post not found!");

		// post is not belonged to this user
		if (req.user.id != post.user._id) return res.send("You are naughty girl!");

		post.status = 'delete';

		post.save(function(err){
			if (err){
				console.log(err);
				//handle erre
			}else{
				res.redirect('/dashboard/posts');
			}
		});
	});
});

/* GET profile page */
router.get('/profile', before.auth, function(req, res){
	res.render('dashboard/profile',{
		title: 'PROFILE',
		profile: 'active',
		csrfToken: req.csrfToken(),
		errors: req.flash('errors'),
		oldInput: req.flash('oldInput'),
		message: req.flash('message')
	});
});

/* GET edit profile page */
router.get('/profile/edit', before.auth, function(req, res){
	res.render('dashboard/editProfile',{
		title: 'EDIT PROFILE',
		profile: 'active',
		csrfToken: req.csrfToken(),
		errors: req.flash('errors'),
		oldInput: req.flash('oldInput'),
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
							req.flash('message', user.email + ' alreay existed!');
							req.flash('oldInput', req.body);
							res.redirect('/dashboard/profile/edit');
						}
					}
					else{
						res.redirect('/dashboard/profile');
					}
				});
			}
		});
	}else{
		console.log(mapErrors);
		req.flash('errors', mapErrors);
		req.flash('oldInput', req.body);
		res.redirect('/dashboard/profile/edit');
	}
});

module.exports = router;