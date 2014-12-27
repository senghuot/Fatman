// var exports = module.exports{};

exports.auth = function(req, res, next){
	if (req.isAuthenticated())
        next();
    else{
        req.flash('IntendedPage', req.originalUrl);
        res.redirect('/authenticate/login');
    }
}

exports.guest = function(req, res, next){
	if (req.isAuthenticated()){
		res.redirect('/');
	}else{
		next();
	}
}