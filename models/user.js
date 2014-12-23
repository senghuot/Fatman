var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
  name: String
});

module.exports = mongoose.model('user', userSchema);