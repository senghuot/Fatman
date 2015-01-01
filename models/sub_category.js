var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sub_categorySchema = Schema({
  type: 		String,
  category: 	{
  					type: 	Schema.Types.ObjectId,
  					ref : 	'Category'
  				},
  view: 	 	{
  					type: 		Number,
  					default: 	0
  				},
  picture: 		String,
  posts:		[{
  					type: 	Schema.Types.ObjectId,
  					ref: 	'Post'
  				}]
});

module.exports = mongoose.model('Sub_Category', sub_categorySchema);