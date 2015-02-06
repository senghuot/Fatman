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
  pictures_s:       [String],
  pictures_l:       [String],
  view:             {
                      type: Number,
                      default: 0
                    },
  status:           {
                      type: String,
                      default: "active"
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