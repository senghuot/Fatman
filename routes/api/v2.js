var express = require('express');
var router = express.Router();
var fs = require('fs');
var easyimage = require('easyimage');
var jwt = require('jwt-simple');
var secret = require('./../../config/secret');

var User = require('./../../models/user');
var Post = require('./../../models/post');
var Location = require('./../../models/location');
var sub_category = require('./../../models/sub_category');
var Category = require('./../../models/category');

var auth = require('./../../jwt/auth.js');

router.post('/login', auth.login);

router.post('/signup', auth.signup);

router.get('/user', auth.auth, function(req, res){
	res.send('Hello User!');
});

// signup form: check if email is taken
router.post('/checkemail', function(req, res){
	var email = req.body.email || '';
	
	User.findOne({email: email}, function(err, user){
		if (err){
			res.status(500);
			res.json({
				'status': 500,
				'message': 'Internal error'
			});
			return;
		}

		if (user){
			res.json({
				"message": 'Email existed!',
				'isExisted': true
			});	
		}else{
			res.json({
				'message': "Email doesn't exitsted",
				'isExisted': false
			});
		}
		
	});
});

// search 
router.get('/search', function(req, res){
	var filter = {};
	filter.status = "active";

	var keyword = req.query.keyword || ''; console.log('keyword: ' + keyword);
	var regex = new RegExp(keyword, 'i');
	filter.title = regex;

	var location = req.query.location || ''; console.log('location: ' + location);
	if (location != "")
		filter.location = location;
	
	var category = req.query.category || ''; console.log('category: ' + category);
	if (category != '')
		filter.sub_category = category;

	var sortFilter = {};
	var sort = req.query.sort || ''; console.log('sort: ' + sort);
	if (sort === 'low')
		sortFilter.price = 1;
	else if (sort === 'high')
		sortFilter.price = -1;
	else if (sort === 'newest')
		sortFilter.post_date = -1;
	else if (sort === 'oldest')
		sortFilter.post_date = 1;

	var skip = req.query.skip || 0; console.log(skip);

	Post.find(filter).sort(sortFilter)
	.populate("location sub_category user")
	.skip(skip * 4).limit(4).exec(function(err, posts){
		if (err) console.log(err);
		else{
			res.json(posts);
		}
	});	
});

// get locations
router.get('/locations', function(req, res){
	Location.find().sort({city: 1})
	.exec(function(err, locations){
        if (err)
            res.status(500).json({
            	'status': 500,
            	'message': 'Internal Error'
            });
        else{
            res.json(locations)
        }
            
    });
});

// get sub_category
router.get('/subcategory', function(req, res){
	sub_category.find().populate('category')
	.exec(function(err, subcategory){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			})
			return;
		}

		res.json(subcategory);
	});
});

// get category
router.get('/categories', function(req, res){
	Category.find().populate('sub_categories').
	exec(function(err, categories){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			});
		}else{
			res.json(categories);
		}
	});
});

// put post
router.put('/post/:postId', auth.auth, function(req, res){
	req.assert('title', 'Title is required!').notEmpty();
	req.assert('description', 'Description is required').notEmpty();
	req.assert('subCategory', 'Sub Category is required').notEmpty();
	req.assert('price', 'Price is required').notEmpty;
	req.assert('condition', 'Condition is required').notEmpty();
	req.assert('location', 'Location is required').notEmpty();
	var mapErrors = req.validationErrors(true);

	if (mapErrors){ // invalid
		res.status(400).json({
			'status': 400,
			'message': 'Input Invalid',
			'error': mapErrors
		});
		console.log(mapErrors);
		return;
	}

	var userId = getUserId(req);
	var postId = req.params.postId;
	
	Post.findOne({_id: postId, user: userId}, function(err, post){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			});
			return;
		}

		if (!post){
			res.status(401).json({
				'status': 401,
				'message': 'Invalid Post!'
			})
			return;
		}

		var photos = [];
		if (req.files.file != undefined){
			if (Object.prototype.toString.call(req.files.file) === '[object Array]'){
				photos = req.files.file;
			}else{
				photos.push(req.files.file);
			}
		}

		var lastPhotoIndex = 0;
		if (post.pictures.length > 0){
			var lastPhoto = post.pictures[post.pictures.length - 1];
			var beginIndex = lastPhoto.lastIndexOf('_') + 1;
			var lastIndex = lastPhoto.lastIndexOf('.');
			lastPhotoIndex = lastPhoto.substring(beginIndex, lastIndex);
			lastPhotoIndex++;
		}

		for (var i = 0; i < photos.length; i++){
			var data = fs.readFileSync(photos[i].path);

			// Move files from tmp to upload folders
			var extension = photos[i].type;
			var index = extension.lastIndexOf('/');
			extension = extension.substring(index + 1);

			var photoIndex = i + lastPhotoIndex;
			var relativePath = '/uploads/posts/' + post._id + '_' + photoIndex + '.' + 'jpg';

			fs.writeFileSync('./public' + relativePath, data);
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

		var oldLocation = post.location;
		var oldSubCategory = post.sub_category;
		var newLocation = req.body.location;
		var newSubCategory = req.body.subCategory;

		// remove post from old location if different from the new one
		if (oldLocation != newLocation){
			Location.findOne(oldLocation, function(err, location){
				if (err){
					res.status(500).json({
						'status': 500,
						'message': 'Internal Error!'
					})
					return;
				}

				var index = location.posts.indexOf(post._id);
				location.posts.splice(index, 1);
				location.save();
			});
		}
		// remove post from old sub category if different from the new one
		if (oldSubCategory != newSubCategory){
			
			sub_category.findOne(oldSubCategory, function(err, subCategory){
				if (err){
					res.status(500).json({
						'status': 500,
						'message': 'Internal Error!'
					})
					return;
				}

				var index = subCategory.posts.indexOf(post._id);
				subCategory.posts.splice(index, 1);
				subCategory.save();
			});
		}

		post.title = req.body.title;
		post.description = req.body.description;
		post.price = req.body.price;
		post.condition = req.body.condition;
		post.location = req.body.location;
		post.sub_category = req.body.subCategory;

		post.save(function(err){
			if (err){
				res.status(err).json({
					'status': 500,
					'message': 'Internal Error'
				});
				return;
			}

			// save post to location if different from old one
			if (oldLocation != newLocation){
				Location.findOne(newLocation, function(err, location){
					location.posts.push(post);
					location.save();
				});
			}
			// save post to sub category if different from old one
			if (oldSubCategory != newSubCategory){
				
				sub_category.findOne(post.sub_category, function(err, subCategory){
					subCategory.posts.push(post);
					subCategory.save();
				});
			}

			Post.findOne({_id: post._id}).populate('sub_category', 'type')
			.populate('location', 'city').exec(function(err, returnPost){
				if (err){
					res.status(500).json({
						'status': 500,
						'message': 'Internal Error'
					});
					return;
				}
				res.json(returnPost);
			})
		});
	});
});

// upload post
router.post('/upload', auth.auth, function(req, res){
	// assertions then create an error map object
	req.assert('category', 'Category is required').notEmpty();
	req.assert('subCategory', 'Sub Category is required').notEmpty();
	req.assert('title', 'Title is required').notEmpty();
	req.assert('condition', 'Condition is required').notEmpty();
	req.assert('details', 'Details is required').notEmpty();
	req.assert('price', 'Price is required').notEmpty();
	req.assert('location', 'Location is required').notEmpty();
	req.assert('user', 'user is required').notEmpty();
	var mapErrors = req.validationErrors(true);

	if (mapErrors){ // invlaid 
		res.status(400).json({
			'status': 400,
			'message': 'Input Invalid',
			'error': mapErrors
		});
		console.log(mapErrors);
		return;
	}

	// console.log(req.files);
	// res.json();

	var date = new Date();
	date.setDate(date.getDate() + 7);

	var post = new Post();
	post.title = req.body.title;
	post.description = req.body.details;
	post.expiration_date = date;
	post.category = req.body.category;
	post.sub_category = req.body.subCategory;
	post.price = req.body.price;
	post.location = req.body.location;
	post.condition = req.body.condition;
	post.user = req.body.user;

	post.save(function(err){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			});
			return;
		}

		// convert an object to an array
		var photos = [];
		if (Object.prototype.toString.call(req.files.file) === '[object Array]')
			photos = req.files.file;
		else
			photos.push(req.files.file);

		// update all the photos
		for (var i = 0; i < photos.length; i++){
			var data = fs.readFileSync(photos[i].path);

			// move the files from tmp to upload folders
			var extension = photos[i].type;
	        var index = extension.lastIndexOf("/");
	        extension = extension.substring(index + 1);

			var relativePath = '/uploads/posts/' + post._id + '_' + i + '.' + extension;

			fs.writeFileSync("./public" + relativePath, data);
			post.pictures.push(relativePath);

			// small image
			var smallImagePath = "/uploads/posts/small/" + post._id + "_s_" + i + ".jpg";
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
			var largeImagePath = "/uploads/posts/large/" + post._id + "_l_" + i + ".jpg";
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
		}// at this point all pictures are saved to file system

		post.save(function(err){
			if (err){
				res.status(500).json({
					'status': 500,
					'message': 'Internal Error'
				});
				return;
			}

			// add reference post to location
			Location.findOne({_id: req.body.location}, function(err, location){
				if (err){
					res.status(500).json({
						'status': 500,
						'message': 'Internal Error'
					});
					return;		
				}
				location.posts.push(post);
				location.save();
			});

			// add reference post to user
			User.findOne({_id: req.body.user}, function(err, user){
				if (err){
					res.status(500).json({
						'status': 500,
						'message': 'Internal Error'
					});
					return;	
				}
				user.posts.push(post);
				user.save();
			});

			// add reference post to subcategory
			sub_category.findOne({_id: req.body.subCategory}, function(err, subCategory){
				if (err){
					res.status(500).json({
						'status': 500,
						'message': 'Internal Error'
					});
					return;	
				}
				subCategory.posts.push(post);
				subCategory.save();
			})

			res.json({
				'status': 200,
				'message': 'Post is saved.'
			});
		});
	});
});

// get all posts 
router.get('/posts', function(req, res){
	Post.find({status: 'active'}).sort({"post_date": -1}).populate("location").populate("user", "-password").limit(20)
	.exec(function(err, posts){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			})
			return;
		}

		res.json(posts);
	});
});

// get single post
router.get('/post/:id', function(req, res){
	var id = req.params.id;
	
	Post.findOne({_id: id}).populate('sub_category location').populate('user', '-password').
	exec(function(err, post){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			})
			return;
		}

		if (!post){
			res.status(401).json({
				'status': 401,
				'message': 'Invalid Post!'
			});
			return;
		}

		res.json(post);
	});
});

// get single user
router.get('/user/:id', auth.auth, function(req, res){
	User.findOne({_id: req.params.id}, '-password', function(err, user){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			})
			return;
		}

		if (!user){
			res.status(401).json({
				'status': 401,
				'message': 'Invalid User!'
			})
			return;
		}

		res.json(user);
	});
});

// put single user
router.put('/user/:id', auth.auth, auth.user, function(req, res){

	var fname = req.body.fname || '';
	var lname = req.body.lname || '';
	var email = req.body.email || '';

	if (fname == '' || lname == '' || email == ''){
		res.status(401);
		res.json({
			'status': 401,
			'message': 'Invalid Fields'
		});
		return;	
	}

	User.findOne({_id: req.params.id}, '-password', function(err, user){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			})
			return;
		}

		if (!user){
			res.status(401).json({
				'status': 401,
				'message': 'Invalid User!'
			})
			return;
		}

		user.fname = fname;
		user.lname = lname;
		user.email = email;

		user.save(function(err){
			if (err){
				res.status(500).json({
					'status': 500,
					'message': 'Internal Error'
				})
				return;	
			}

			res.json(user);
		});
	});
});

// get posts for specific users
router.get('/user/:id/posts', auth.auth, auth.user, function(req, res){
	var filter = {};
	filter.user  = req.params.id;
	filter.status = 'active';
	Post.find(filter).populate("sub_category", "type").populate('location', 'city')
	.exec(function(err, posts){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			});
			return;
		}

		res.json(posts);
	});
});

// delete image from specific post
router.delete('/post/:id/image/:index', auth.auth, function(req, res){
	var postId = req.params.id || '';
	var imageIndex = req.params.index || '';

	if (isNaN(imageIndex)){
		res.status(401).json({
			'status': 401,
			'message': "Invalid Image Index!"
		});
		return;
	}

	var userId = getUserId(req);

	var filter = {};
	filter._id = postId;
	filter.user = userId;

	Post.findOne(filter, function(err, post){
		if (err){
			res.status(500).json({
				'status': 500,
				'message': 'Internal Error'
			});
			return;
		}

		if (!post){
			res.status(401).json({
				'status': 401,
				'message': 'Invalid Post'
			});
			return;
		}

		post.pictures.splice(imageIndex, 1);
		post.pictures_l.splice(imageIndex, 1);
		post.pictures_s.splice(imageIndex, 1);

		post.save(function(err){
			if (err){
				res.status(500).json({
					'status': 500,
					'message': 'Internal Error'
				});
				return;
			}

			res.json({
				'status': 200,
				'message': 'Image delete successfully!'
			})
		});
	});
});

function getUserId(req){
	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || (req.headers['x-access-token']);
	var key = (req.body && req.body.key) || (req.query && req.query.x_key) || (req.headers['x-key']);	

	if (token){
		var decoded = jwt.decode(token, secret());
		return decoded.iss;	
	}else{
		return "";
	}
}
module.exports = router;