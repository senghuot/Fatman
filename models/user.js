var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
  email: {type: String, unique: true}
  fname: String,
  lname: String,
  password: String
});

module.exports = mongoose.model('user', userSchema);