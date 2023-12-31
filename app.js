const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require('mongoose')
const postModel = require('./models/model')
const ObjectId = new mongoose.Types.ObjectId ;
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const connectdb = require("./config/connectdb");
const userRoutes = require("./routes/userRoutes")
const commentsRoutes = require("./routes/commentsRoutes")
const postDetailsRoutes = require("./routes/postDetailsRoutes")



const homeRoutes = require("./routes/homeRoutes")

const composeRoutes = require("./routes/composeRoutes")

const cookieParser = require('cookie-parser');
const helmet = require("helmet");


const app = express();
//cors policy
app.use(cors());

//bcz its api we need to use json: so its middleware
app.use(express.json());

app.use(helmet());

app.use(cookieParser());




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));



app.use("/" , homeRoutes)

app.use("/compose", composeRoutes);


app.use("/posts", postDetailsRoutes);
app.use("/posts", commentsRoutes);


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
