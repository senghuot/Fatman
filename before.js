// check for authenticated user
exports.auth = function(req, res, next){
	if (req.isAuthenticated())
        next();
    else{
        req.flash('IntendedPage', req.originalUrl);
        res.redirect('/authenticate/login');
    }
}

// check for guest user
exports.guest = function(req, res, next){
	if (req.isAuthenticated()){
		res.redirect('/');
	}else{
		next();
	}
}