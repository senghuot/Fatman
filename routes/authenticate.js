var express = require('express');
var router = express.Router();
var passport = require('./../auth');
var before = require('./../before');

var bcrypt = require('bcrypt');

var User = require('./../models/user');

router.get('/login', before.guest, function(req, res){
    res.render('login', {
        title: 'LOG IN',
        csrfToken: req.csrfToken(),
        message: req.flash('message'),
        login: "active"
    });
});

router.post('/login', function(req, res, next){
    passport.authenticate('local', function(err, user, info){
        if (err) return next(err);
        if (!user){
            req.flash('message', info.message);
            return res.redirect('/authenticate/login');
        }

        req.logIn(user, function(err){
            if (err) return next(err);

            var IntendedPage = req.flash('IntendedPage');
            console.log("In authenticate /login: " + IntendedPage);
            if (IntendedPage == '')
                return res.redirect('/');
            return res.redirect(IntendedPage);    
        });
    })(req, res, next);
});

router.get('/logout', before.auth, function(req, res){
    req.logout();
    res.redirect('/');
});

// need to authenticate before access that page
router.get('/needAuth', before.auth, function(req, res){
        res.send('success');
    }
);

module.exports = router;