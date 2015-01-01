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

	Sub_Category.find().populate({path: "posts", options: { sort: {"type":1} } }).exec(function(err, subs){
		console.log(subs);
		res.json(subs);
	});

});

module.exports = router;