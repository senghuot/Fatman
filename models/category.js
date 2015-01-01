var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = Schema({
  type: 			       String,
  sub_categories: 	 [{
  						          type: Schema.Types.ObjectId,
  						          ref: 'Sub_Category'
  					         }],
  view: 			       {
  						          type: Number,
  						          default: 0
  					         },
  picture: 			     String
});

module.exports = mongoose.model('Category', categorySchema);