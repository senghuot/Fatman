var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = Schema({
  city: String,
  posts: [{
  	type: Schema.Types.ObjectId,
  	ref: 'Post'
  }]
});

module.exports = mongoose.model('Location', locationSchema);