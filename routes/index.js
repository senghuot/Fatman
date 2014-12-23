var express = require('express');
var router = express.Router();

var User = require('./../models/user')

/* GET home page. */
router.get('/', function(req, res) {
  User.find(function(err, users){
    res.send(users);
  });

  // res.render('index', { title: 'Express' });
});

module.exports = router;

