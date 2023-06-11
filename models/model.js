const mongoose = require("mongoose")

const postSchema = {
    title : String,
    content : String
};

const postModel = mongoose.model("postModel" , postSchema);
module.exports =  postModel;