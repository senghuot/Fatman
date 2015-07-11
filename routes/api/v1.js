var express = require('express');
var router = express.Router();

var User = require("./../../models/user");
var Post = require("./../../models/post");
var Sub_Category = require("./../../models/sub_category");
var Category = require("./../../models/category");
var Location = require("./../../models/location");

/* GET users listing. */
router.get('/users', function(req, res) {
  User.find(function(err, users){
    res.json(users);
  });
});

router.get('/user', function(req, res) {
  User.findOne({email: req.params.email}, function(err, users){
    res.json(users);
  });
});

router.get('/posts', function(req, res){
	var skip = req.query.skip;
	var limit = req.query.limit;

	Post.find().sort({post_date: -1}).populate("location sub_category user").skip(skip*limit).limit(limit)
	.exec(function(err, posts){
		res.json(posts);
	});

});

router.get("/post/:id", function(req, res){
	Post.findOne({_id: req.params.id}, function(err, post){
		res.json(post);
	});
});

// GET search page
router.get('/search', function(req, res){
	var filter = {};
	filter.status = "active";

	var keyword = req.query.keyword;
	var regex = new RegExp(keyword, 'i');
	filter.title = regex;

	var location = req.query.location;
	if (location !== "")
		filter.location = location;
	
	var category = req.query.category;
	if (category !== '')
		filter.sub_category = category;


	var sortFilter = {};
	var sort = req.query.sort;
	if (sort === 'low')
		sortFilter.price = 1;
	else if (sort === 'high')
		sortFilter.price = -1;
	else if (sort === 'newest')
		sortFilter.post_date = -1;
	else if (sort === 'oldest')
		sortFilter.post_date = 1;

	var skip = req.query.skip;

	Post.find(filter).sort(sortFilter).populate("location sub_category user")
	.skip(skip * 2).limit(2).exec(function(err, posts){
		if (err) console.log(err);
		else{
			console.log(posts)
			res.json(posts);
		}
	});	
});

// testing delete some images from post
router.put('/images/:postId', function(req, res){
	console.log('delete image....');
	
	var postId = req.params.postId;
	var image = req.body.image;

	console.log("Image: " + image);
	console.log("postId: " + postId);

	Post.findOne({_id: postId}, function(err, post){
		if (err) console.log(err);
		else{
			for (var i = 0; i < post.pictures.length; i++){
				var picture = post.pictures[i];
				var imageNumber = picture.substring(picture.lastIndexOf("_") + 1, picture.lastIndexOf("."));

				if (image == imageNumber){
					console.log("image is matched: " + image);
					post.pictures.splice(i, 1);
				}
			}

			for (var i = 0; i < post.pictures_l.length; i++){
				var picture = post.pictures_l[i];
				var imageNumber = picture.substring(picture.lastIndexOf("_") + 1, picture.lastIndexOf("."));

				if (image == imageNumber){
					console.log("image is matched: " + image);
					post.pictures_l.splice(i, 1);
				}
			}

			for (var i = 0; i < post.pictures_s.length; i++){
				var picture = post.pictures_s[i];
				var imageNumber = picture.substring(picture.lastIndexOf("_") + 1, picture.lastIndexOf("."));

				if (image == imageNumber){
					console.log("image is matched: " + image);
					post.pictures_s.splice(i, 1);
				}
			}

			post.save();
		}
	});

	res.json('ok');
});

module.exports = router;