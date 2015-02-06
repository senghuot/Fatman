var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Location = require('./../models/location');
var Post = require('./../models/post');

/* GET home page. */
router.get('/', function(req, res) {
  Location.find().populate('posts', null, {status: 'active'})
  .exec(function(err, locations){
    console.log(locations);
    res.json(locations);
  });
});

router.get('/put/:location', function(req, res) {
  var location = new Location({
    city: req.params.location
  });

  location.save();
});

router.get('/posts/put/:info', function(req, res) {
  var expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 8);

  var post = new Post();
  post.title = req.params.info;
  post.description = req.params.info;
  post.expiration_date = expirationDate;
  post.sub_category_id = mongoose.Types.ObjectId("5499471f503c016b24b5b53e");
  post.pictures.push("images/pic1");
  post.pictures.push("images/pic2");
  post.pictures.push("images/pic3");

  post.save(function(err){
    if (err)
      console.log(err);
    else
      res.redirect('/locations/posts');
  });
});

router.get('/posts', function(req, res){
  Post.find(function(err, posts){
    res.send(posts);
  });
});

router.get('/post', function(req, res){
  res.render('locations',{
    message: req.flash("message"),
    title: "LOCATION",
    csrfToken: req.csrfToken()
  });
});

router.post('/post', function(req, res){
  var location = new Location({
    city: req.body.location
  });

  location.save(function(err){
    if (err) return console.log(err);

    res.redirect('/locations/post');
  });
});

router.get("/remove/:id", function(req, res){
  Location.find({_id: req.params.id}).remove(function(err){
    if (err) return res.send(err);
    res.redirect('/locations/post');  
  });
  
});

module.exports = router;
