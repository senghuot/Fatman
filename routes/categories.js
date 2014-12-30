var express = require('express');
var router = express.Router();

var Category = require("./../models/category");
var Sub_Category = require("./../models/sub_category");

/* GET categories listing. */
router.get('/', function(req, res) {
  Category.find().populate('sub_categories').exec(function(err, categories){
    console.log(categories);
    res.json(categories);
  });
});

router.get('/put/:category', function(req, res) {
  var category = new Category({
  	type: req.params.category
  });

  category.save(function(err){
  	if (err)
  		console.log(err);
  	else
  		res.redirect("/categories");
  });
});

// sub categories
router.get('/sub_categories', function(req, res){
  Sub_Category.find(function(err, sub_categories){
    if (err)
      console.log(err);
    else
      res.send(sub_categories);
  });
});

router.get('/sub_categories/:sub_category', function(req, res){
  
  Sub_Category.findOne({type: req.params.sub_category}, function(err, sub_category){

    Category.findOne({_id: sub_category.category_id}, function(err, category){
      res.send(category + sub_category);
    });

  });

});

router.get('/sub_categories/put/:sub_category/:category', function(req, res){
  Category.findOne({type: req.params.category}, function(err, electronic){

    var sub_category = new Sub_Category({
      type: req.params.sub_category,
      category_id: electronic._id
    });

    sub_category.save(function(err){
      if (err)
        console.log(err);
      else
        res.redirect('/categories/sub_categories');
    });

  });
});

router.get('/pop', function(req, res){
  // Category.findOne({type: 'automobile'}, function(err, auto){
  //   Sub_Category.find({$or: [ {type: 'moto bike'}, {type: 'car'} ]}, function(err, autoSubs){
  //     autoSubs.forEach(function(autoSub){
  //       console.log(autoSub);
  //       auto.sub_categories.push(autoSub);
  //     });
  //     auto.save();
  //     res.send(autoSubs);
  //   });
  // });
});

router.get('/getCat', function(req, res){
  Category.findOne({type: 'electronic'})
  .populate('sub_categories')
  .exec(function(err, cat){
    if (err) console.log(err);
    console.log(cat);
    res.send(cat.sub_categories[0].type);
  });
});

router.get('/getSub', function(req, res){
  Sub_Category.find()
  .populate('category')
  .exec(function(err, sub){
    if (err) console.log(err);
    console.log(sub);
    res.send(sub);
  });
});

module.exports = router;