var express = require('express');
var router = express.Router();

var User = require("./../models/user");

/* GET users listing. */
router.get('/', function(req, res) {
  User.find(function(err, users){
    res.send(users);
  });
});

router.get("/put/:username", function(req, res){
  var user = new User({
    email: req.params.username,
    fname: req.params.username,
    lname: req.params.username,
    password: req.params.username
  });

  user.save(function(err){
    if (err) 
      console.log(err);
    else
      console.log("successfully saved to database");
  });
});

router.get('/:username', function(req, res){
  User.findOne({email: req.params.username}, function(err, user){
    if (err){
      console.log(err);
      res.send("no user");
    }else{
      res.send(user);
    }

  });
});

router.get('/delete/:username', function (req, res) {
  User.remove({email: req.params.username}, function(err, user){
    if (err) 
      console.log(err);
    else
      res.redirect('/users');
  });
});

router.get('/check/:password', function(req, res){
  User.findOne({email: 'chamnaplim18@yahoo.com'}, function(err, user){
      if ( user.validatePassword(req.params.password) ){
        res.send('true');
      }else{
        res.send('false');
      }
  });
});

module.exports = router;
