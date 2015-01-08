// include all the modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressSession = require('express-session');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var passport = require('./auth');
var csrf = require('csurf');
var app = express();
var multipart = require('connect-multiparty');

// include the routes
var routes = require('./routes/index');
var users = require('./routes/users');
var categories = require('./routes/categories');
var apiV1 = require('./routes/api/v1');
var locations = require('./routes/locations');
var hash = require('./routes/hash');
var authenticate = require('./routes/authenticate');
var dashboard = require('./routes/dashboard');
var image = require('./routes/image');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.siteName = "FATMAN";

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(expressValidator());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(multipart());
app.use(csrf());


// give user & location object to every route
var Location = require("./models/location");
app.use(function(req, res, next){
    
    Location.find().sort({city: 1}).exec(function(err, locations){
        if (err)
            console.log(err);
        else{
            res.locals.isAuthenticated = req.isAuthenticated();
            res.locals.user = req.user;
            res.locals.locations = locations;
            next();
        }
            
    });
});

// routes
app.use('/', routes);
app.use('/users', users);
app.use('/categories', categories);
app.use('/api/v1', apiV1);
app.use('/locations', locations);
app.use('/hash', hash);
app.use('/authenticate', authenticate);
app.use("/dashboard", dashboard);
app.use("/image", image);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
    
    mongoose.connect('mongodb://localhost/fatman');
}




// production error handler
// no stacktraces leaked to user
if (app.get('env') === 'production'){
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    mongoose.connect('mongodb://localhost/fatman');
}


module.exports = app;
