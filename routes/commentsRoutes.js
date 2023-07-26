const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const ObjectId = new mongoose.Types.ObjectId ;

const postModel = require('../models/model');
const checkUserAuth = require('../middlewares/auth-middleware');



router.post("/:postId/comments",  checkUserAuth  , (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body;
  const { name, email } = req.user;
    // Create a new comment object
    const comment = {
      name,
      email,
      content,
      timestamp: new Date(),
    };
  
    // Find the post by ID and push the new comment to the comments array
    postModel
      .findByIdAndUpdate(
        postId,
        { $push: { comments: comment } },
        { new: true }
      )
      .then((post) => {
        if (!post) {
          return res.status(404).send("Post not found");
        }
  
        res.redirect(`/posts/${postId}`);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Internal Server Error");
      });
  });
  



  module.exports = router;