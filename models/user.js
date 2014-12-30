var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = Schema({
  email: {type: String, unique: true},
  fname: String,
  lname: String,
  password: String,
  posts:[{
  	type: Schema.Types.ObjectId,
  	ref: 'Post'
  }]
});

// mehtod for comparing password
userSchema.methods.validatePassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

// static method for hash password
userSchema.statics.hashPassword = function(password){
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(password, salt);
	return hash;
};

module.exports = mongoose.model('user', userSchema);