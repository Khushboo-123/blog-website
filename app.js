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


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
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

  if (selectedCategory && selectedCategory !== "All") {
    query.category = selectedCategory; // Add the category to the query object if a category is selected
  }

  postModel
    .find(query) // Pass the query object to filter the posts
    .then((posts) => {
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});



app.get("/compose",  function (req, res) {
  res.render("compose");
});

app.post("/compose",  function (req, res) {
  const post = new postModel({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.body.author,
    category: req.body.category,
    
  });


  post.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.error(err);
      res.redirect("/error");
    });

});

app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  if (!mongoose.Types.ObjectId.isValid(requestedPostId)) {
    return res.status(404).send("Invalid post ID");
  }

  postModel.findOne({ _id: new mongoose.Types.ObjectId(requestedPostId) })
    .then((post) => {
      if (!post) {
        return res.status(404).send("Post not found");
      }

      res.render("post", {
        title: post.title,
        content: post.content,
        category: post.category,

      });
    
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});

const port = process.env.PORT;

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
