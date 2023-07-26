const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const postModel = require('../models/model');
const userModel = require('../models/user');
const cookieParser = require('cookie-parser');

const checkUserAuth = require('../middlewares/auth-middleware');


  router.get("/",  checkUserAuth , async function (req, res) {
    const token = req.cookies.token;
  
    const { userId } = jwt.verify(token, process.env.SECRET_KEY);
  
    // Get user from token
    const user =   await userModel.findById(userId).select("name");
  
    res.render("compose", {
      selectedCategory: "", // Pass an empty string as the selected category
      author: req.user.name,
    });
  });

  router.post("/", checkUserAuth, async function (req, res) {
    const token = req.cookies.token;
    const { userId } = jwt.verify(token, process.env.SECRET_KEY);
  
    // Get user from token
    const user = await userModel.findById(userId).select("name");
  
    // Create a new post instance
    const post = new postModel({
      title: req.body.postTitle,
      content: req.body.postBody,
      author: req.user.name,
      category: req.body.category,
      imageUrl:" ",
    });
  
    post.save()
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/error");
    });
  });
  
  

  module.exports = router;