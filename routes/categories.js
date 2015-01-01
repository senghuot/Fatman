var express = require('express');
var router = express.Router();
var fs = require('fs');

var Category = require("./../models/category");
var Sub_Category = require("./../models/sub_category");

/* GET categories listing. */
router.get('/', function(req, res) {
  Category.find().populate('sub_categories').exec(function(err, categories){
    // console.log(categories);
    res.json(categories);
  });
});

router.get('/type/:type', function(req, res) {
  Category.find({type: new RegExp(req.params.type, "i")}).populate('sub_categories').exec(function(err, categories){
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

router.get("/post", function(req, res){
  Category.find().populate("sub_categories").exec(function(err, categories){
    if (err) console.log(err);
    else{
      res.render('category', {
        title: "POST CATEGORY",
        categories: categories,
        message: req.flash('message'),
        csrfToken: req.csrfToken()
      });
    }
  });
});

router.post('/post', function(req, res){
  var cat = new Category();
  cat.type = req.body.category;

  cat.save(function(err){
    if (err) console.log(err);
    else{
      req.flash('message', 'category added');
      res.redirect("/categories/post");
    }
  });
});

router.get("/subcategories/post", function(req, res){
  Category.find().populate("sub_categories").exec(function(err, categories){
    if (err) console.log(err);
    else{
      console.log(categories);
      res.render('subCategory', {
        title: "POST SUBCATEGORY",
        categories: categories,
        message: req.flash('message'),
        csrfToken: req.csrfToken()
      });
    }
  });
});

router.post("/subcategories/post", function(req, res){
  Category.findOne({_id: req.body.category}, function(err, category){
    var subCat = new Sub_Category();
    subCat.type = req.body.subcategory;
    subCat.category = category._id;

    subCat.save(function(err){
      if (err) console.log(err);
      else{
        category.sub_categories.push(subCat);
        category.save(function(err){
          if (err) console.log(err);
        });

        var pic = req.files.picture;

        // get picture byte code
        var data = fs.readFileSync(pic.path);
        
        // get original extension
        var extension = pic.type;
        var index = extension.lastIndexOf("/");
        extension = extension.substring(index + 1);

        var relativePath = "/img/subcategory/" + subCat._id + "." + extension;
        fs.writeFileSync("./public" + relativePath, data);

        subCat.picture = relativePath;

        subCat.save(function(err){
          req.flash('message', 'sub category added successfully');
          res.redirect("/categories/subcategories/post"); 
        });
      }
    });
    
  });
});

router.get('/remove/:id', function(req, res){
  Category.findOne({_id: req.params.id}, function(err, cat){
    var subs = cat.sub_categories;
    Sub_Category.find({category: cat._id}).remove(function(err){
      cat.remove();
      res.redirect('/categories/post');
    });
  });
});

router.get('/subcategories/remove/:id', function(req, res){
  Category.findOne({sub_categories: req.params.id}, function(err, cat){
    var subCats = cat.sub_categories;
    var index = subCats.indexOf(req.params.id);

    subCats.splice(index, 1);
    console.log(subCats);

    cat.save(function(err){
      Sub_Category.findOne({_id: req.params.id}).remove(function(err){
        res.redirect('/categories/subcategories/post');
      });  
    });
  });
});

module.exports = router;