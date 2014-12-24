var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = Schema({
  title:            String,
  description:      String,
  post_date:        {
                      type: Date, 
                      default: Date.now
                    },
  expiration_date:  Date,
  price:            Number,
  condition:        String,
  pictures:          [String],
  
  // collection references
  sub_category_id: {type: Schema.Types.ObjectId},
  location_id: {type: Schema.Types.ObjectId},
  user_id: {type: Schema.Types.ObjectId}
});

module.exports = mongoose.model('post', postSchema);