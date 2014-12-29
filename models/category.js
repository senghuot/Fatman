var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = Schema({
  type: String,
  sub_categories: [{
  	type: Schema.Types.ObjectId,
  	ref: 'Sub_Category'
  }]
});

module.exports = mongoose.model('Category', categorySchema);