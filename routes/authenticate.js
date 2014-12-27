var express = require('express');
var router = express.Router();
var passport = require('./../auth');

var bcrypt = require('bcrypt');

var User = require('./../models/user');

// middleware for checking if use already authenticated
var auth = function (req, res, next){
    if (req.isAuthenticated())
        next();
    else{
        req.flash('IntendedPage', req.originalUrl);
        res.redirect('/authenticate/login');
    }
}

var guest = function (req, res, next){
    if (req.isAuthenticated())
        res.redirect('/');
    else
        next();
}

router.get('/login', guest, function(req, res){
    res.render('login', {message: req.flash('message')});
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
        
            if (IntendedPage == '')
                return res.redirect('/');
            return res.redirect(IntendedPage);    
        });
    })(req, res, next);
});

router.get('/logout', auth, function(req, res){
    req.logout();
    res.redirect('/');
});

// need to authenticate before access that page
router.get('/needAuth', auth, function(req, res){
        res.send('success');
    }
);

module.exports = router;