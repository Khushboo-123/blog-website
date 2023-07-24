const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose')
const postModel = require('./models/model')
const userModel = require('./models/user');
const ObjectId = new mongoose.Types.ObjectId ;
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const connectdb = require("./config/connectdb");
const userRoutes = require("./routes/userRoutes")
const checkUserAuth = require('./middlewares/auth-middleware')
const jwt = require('jsonwebtoken');

const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());




const homeStartingContent = "Pracedge Community is a dynamic and innovative platform that is dedicated to upskilling people by providing them with comprehensive Guidance, Resources, Internship Opportunities.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  
  res.render("contact", { contactContent: contactContent });
});

app.get("/", (req, res) => {
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





app.get("/compose",  checkUserAuth , function (req, res) {
  const token = req.cookies.token;

  const { userId } = jwt.verify(token, process.env.SECRET_KEY);

  // Get user from token
  const user =  userModel.findById(userId).select("name");

  res.render("compose", {
    selectedCategory: "", // Pass an empty string as the selected category
    author: req.user.name,
  });
});




app.post("/compose", checkUserAuth, function (req, res) {
  const token = req.cookies.token;
  const { userId } = jwt.verify(token, process.env.SECRET_KEY);

  // Get user from token
  const user = userModel.findById(userId).select("name");

  // Create a new post instance
  const post = new postModel({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.user.name,
    category: req.body.category,
    imageUrl:" ",
  });

  // Check if an image was uploaded
  if (req.file) {
    // Save the image to Firebase Storage
    const file = req.file;

    // Get the original filename of the uploaded image
    const originalFilename = file.originalname;

    // Upload the image file to Firebase Storage
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(originalFilename);
    fileRef
      .put(file.buffer)
      .then(() => {
        // Get the download URL of the uploaded image
        return fileRef.getDownloadURL();
      })
      .then((downloadURL) => {
        // Set the image URL in the post document
        post.image = downloadURL;

        // Save the post in the database
        return post.save();
      })
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.error(err);
    res.send(error.message);
        });
  } else {
    // No image uploaded, save the post without an image
    post.save()
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.error(err);
        res.redirect("/error");
      });
  }
});


app.post("/posts/:postId/comments", (req, res) => {
  const postId = req.params.postId;
  const { name, email, content } = req.body;

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

app.get("/posts/:postId", function (req, res) {
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






//cors policy
app.use(cors());

//bcz its api we need to use json: so its middleware
app.use(express.json());

//Database
connectdb();


//load routes 
app.use("/api/user" , userRoutes);

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
