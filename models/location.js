var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = Schema({
  city: String
});

module.exports = mongoose.model('location', locationSchema);