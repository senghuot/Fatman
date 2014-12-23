var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = Schema({
  type: String
});

module.exports = mongoose.model('category', categorySchema);