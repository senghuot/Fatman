var express = require('express');
var router = express.Router();

var User = require("./../../models/user");

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

module.exports = router;