const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const postModel = require('../models/model');
const userModel = require('../models/user');
const checkUserAuth = require('../middlewares/auth-middleware');
const admin = require('../firebaseConfig');

// Initialize Firebase Storage
const bucket = admin.storage().bucket();


// Set up the multer middleware to handle image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); 
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

router.get("/", checkUserAuth, async function (req, res) {
  const token = req.cookies.token;

  const { userId } = jwt.verify(token, process.env.SECRET_KEY);

  // Get user from token
  const user = await userModel.findById(userId).select("name");

  res.render("compose", {
    selectedCategory: "", // Pass an empty string as the selected category
    author: req.user.name,
  });
});

router.post("/", checkUserAuth, upload.single('image'), async function (req, res) {

  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.userId;
    const user = await userModel.findById(userId).select("name");
    const imageFile = req.file;


    let imageUrl = '';

    if (imageFile) {
      const imagePath = imageFile.path;
      const imageUploadResult = await bucket.upload(imagePath, {
        // Set the destination path in Firebase Storage (you can customize it as needed)
        destination: `posts/${imageFile.filename}`,
      });

      // Get the public URL of the uploaded image
      imageUrl = imageUploadResult[0].metadata.mediaLink;

      post.imageUrl = imageUrl;

      fs.unlinkSync(imagePath);
    }
    const post = new postModel({
      title: req.body.postTitle,
      content: req.body.postBody,
      author: req.user.name,
      category: req.body.category,
      imageUrl:imageUrl,
    });
  
  

    // Save the new post to your database
    const savedPost = await postModel.create(post);

    // Redirect the user to the post details page or any other page as needed
    res.redirect("/");
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Error creating post');
  }
});

module.exports = router;
