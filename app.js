//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose')
const postModel = require('./models/model')
const ObjectId = new mongoose.Types.ObjectId ;

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
  postModel
    .find()
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
app.get("/compose", function (req, res) {
  res.render("compose");
});



app.post("/compose", function (req, res) {
  const post = new postModel({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.body.author
  });

  post.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      // Handle the error
      console.error(err);
      // Redirect to an error page or send an error response
      res.redirect("/error");
    });

});

app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  // Check if the requestedPostId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(requestedPostId)) {
    // Handle the case where the requestedPostId is invalid
    return res.status(404).send("Invalid post ID");
  }

  postModel.findOne({ _id: new mongoose.Types.ObjectId(requestedPostId) })
    .then((post) => {
      if (!post) {
        // Handle the case where the post is not found
        return res.status(404).send("Post not found");
      }

      res.render("post", {
        title: post.title,
        content: post.content
      });
    })
    .catch((err) => {
      console.log(err);
      // Handle any other errors that occur during the process
      res.status(500).send("Internal Server Error");
    });
});


 mongoose.connect("mongodb+srv://khushboo-123:testing-123@api.l6ttkfg.mongodb.net/postDB" , {
  useNewUrlParser: true,

  useUnifiedTopology: true,
}).then(() => {
  app.listen(3000, function () {
    console.log("Server started on port 3000");
  });
}).catch(err => console.error("Error connecting to MongoDB:", err));

