const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const postModel = require('../models/model');
const userModel = require('../models/user');
const cookieParser = require('cookie-parser');

const checkUserAuth = require('../middlewares/auth-middleware');

const homeStartingContent = "Pracedge Community is a dynamic and innovative platform that is dedicated to upskilling people by providing them with comprehensive Guidance, Resources, Internship Opportunities.";


router.get("/", (req, res) => {
    const selectedCategory = req.query.category; // Get the selected category from the query parameters
  
    let query = {}; // Define an empty query object
  
    if (selectedCategory && selectedCategory !== "All Categories") {
      query.category = selectedCategory; // Add the category to the query object if a category is selected
    }
  
    postModel
      .find(query) // Pass the query object to filter the posts
      .sort({ date: -1 }) // Sort the posts in descending order based on the "date" field
      .then((posts) => {
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts,
          selectedCategory: "", // Pass the selected category to the view
         
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Internal Server Error");
      });
  });


  module.exports = router;