const express = require('express');
const mongoose =  require('mongoose')
const router = express.Router();
const ObjectId = new mongoose.Types.ObjectId ;

const dotenv = require('dotenv');
dotenv.config();

const postModel = require('../models/model');

const cookieParser = require('cookie-parser');



router.get("/:postId", function (req, res) {
    const postId = req.params.postId;
  
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(404).send("Invalid post ID");
    }
  
    postModel.findOne({ _id: new mongoose.Types.ObjectId(postId) })
      .then((post) => {
        if (!post) {
          return res.status(404).send("Post not found");
        }
  
        // Find the previous post
        postModel.findOne({ date: { $lt: post.date } })
          .sort({ date: -1 })
          .then((prevPost) => {
            const prevPostId = prevPost ? prevPost._id : null;
  
            // Find the next post
            postModel.findOne({ date: { $gt: post.date } })
              .sort({ date: 1 })
              .then((nextPost) => {
                const nextPostId = nextPost ? nextPost._id : null;
  
                res.render("post", {
                  postId: postId,
                  title: post.title,
                  author:post.author,
                  content: post.content,
                  category: post.category,
                  comments: post.comments,
                  prevPostId: prevPostId,
                  nextPostId: nextPostId,
                  selectedCategory: '',
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).send("Internal Server Error");
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Internal Server Error");
      });
  });

  module.exports = router;