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
  pictures:         [String],
  view:             {
                      type: Number,
                      default: 0
                    },
  
  // collection references
  sub_category: {
    type: Schema.Types.ObjectId,
    ref: 'Sub_Category'
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Post', postSchema);