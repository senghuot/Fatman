var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = Schema({
  city: 	String,
  posts: 	[{
  				type: Schema.Types.ObjectId,
  				ref: 'Post'
  			}],
  view: 	{
  				type: Number,
  				default: 0
  			}
});

module.exports = mongoose.model('Location', locationSchema);