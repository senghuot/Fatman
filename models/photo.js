var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var photoSchema = Schema({
  path:   [String]
});

module.exports = mongoose.model('Photo', photoSchema);