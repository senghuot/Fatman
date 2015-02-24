var passport = require('passport');
var passportLocal = require('passport-local');

var User = require('./models/user');

passport.use(new passportLocal.Strategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done){ 

        User.findOne({email: email},
            function(err, user){
                if (err){
                    console.log('something went wrong');
                    return done(err);
                }

                if (!user){
                    console.log('user doesn\'t exist');
                    return done(null, false, {message: 'Incorrect username or password.'});
                }

                if (!user.validatePassword(password)){
                    return done(null, false, {message: 'Incorrect username or password.'});
                }
                
                return done(null, user);
            }
        );
    }
));

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findOne({_id: id}, function(err, user){
        if (err)
            console.log(err);
        else{
            done(null, user);
        }
    });
});

module.exports = passport;