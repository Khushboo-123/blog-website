const mongoose = require("mongoose")

const postSchema = {
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
    date:{
        type:Date,
        default: Date.now()

    },
    comments: [
        {
          name: { type: String, required: true },
          email: { type: String, required: true },
          content: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
    
};

const postModel = mongoose.model("postModel" , postSchema);
module.exports =  postModel;