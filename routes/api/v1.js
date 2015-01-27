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
	// Post.find().populate("sub_category").exec(function(err, posts){
		
	// 	Post.populate(posts, {path: "sub_category.category", model: "Category"}, function(err, data){	
	// 		console.log(data);
	// 		res.json(data);
	// 	});

	// });

	// Sub_Category.find().populate({path: "posts", options: { sort: {"type":1} } }).exec(function(err, subs){
	// 	console.log(subs);
	// 	res.json(subs);
	// });

	// Post.aggregate([{$group: {_id: "$condition"} }]).exec(function(err, posts){
	// 	console.log(posts);
	// 	res.json(posts);
	// });

	Location.findOne({city: "phnom penh"}).populate({path: "posts"}).exec(function(err, loc){
		var locs = loc.toObject();
		locs.posts = locs.posts.sort(function(a, b){
			if (a.condition > b.condition) return 1;
			if (a.condition < b.condition) return -1;
			return 0;
		});
		console.log(locs);
		res.json(locs);
	});
});

router.get('/search', function(req, res){
	var filter = {};

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

router.delete('/images/', function(req, res){
	console.log('delete image....');
});

module.exports = router;