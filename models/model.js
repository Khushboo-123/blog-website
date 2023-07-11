const mongoose = require("mongoose")

const postSchema = {
    title : String,
    content : String,
    author: String,
    category: String,
    date:{
        type:Date,
        default: Date.now()

    }
};

const postModel = mongoose.model("postModel" , postSchema);
module.exports =  postModel;