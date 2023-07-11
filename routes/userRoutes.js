const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
const session = require('express-session');
const UserController = require('../controllers/userController');
const checkUserAuth = require('../middlewares/auth-middleware')

  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));

//Public Routes -- without login can be accessed
router.post("/register" , UserController.userRegistration)
router.post("/login" ,  UserController.userLogin)
router.post("/send-User-Password-Reset-Email" , UserController.sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token" , UserController.userPasswordReset);


//Protected Routes -- can be accessed only after login like to go in dashboard need to be get authenticated
router.use("/changePassword" , checkUserAuth)


router.post("/changePassword"  , UserController.changePassword)
router.get("/loggedUser" , checkUserAuth , UserController.loggedUser);

module.exports = router;