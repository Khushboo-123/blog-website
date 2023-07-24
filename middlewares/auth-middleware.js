const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const compression = require('compression')
const express = require('express')
const app = express()
app.use(compression())

const checkUserAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).render("unauthorized");
    } else {
      const { userId } = jwt.verify(token, process.env.SECRET_KEY);

      // Get user from token
      req.user = await UserModel.findById(userId).select('-password');

      if (req.user.role === "admin") {
        // User is an admin, proceed to the next middleware or route handler
        next();
      } else {
        // User is not an admin, return an unauthorized error
        res.status(401).json({ error: "You are not authorized" });
      }
    }
  } catch (error) {
    res.status(401).json({
      status: false,
      data: null,
      message: "Unauthorized Access",
    });
  }
};

module.exports = checkUserAuth;
