var express = require('express');
var router = express.Router();

var Category = require("./../models/category");

/* GET categories listing. */
router.get('/', function(req, res) {
  Category.find(function(err, categories){
    res.send(categories);
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

module.exports = router;