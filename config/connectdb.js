const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectdb = async () => {
  try {
    await mongoose.connect('mongodb+srv://khushboo-123:testing-123@api.l6ttkfg.mongodb.net/postDB'
    );
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

module.exports = connectdb;
