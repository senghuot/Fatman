var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sub_categorySchema = Schema({
  type: String,
  category_id:{
  	type: Schema.Types.ObjectId
  } 
});

module.exports = mongoose.model('sub_category', sub_categorySchema);