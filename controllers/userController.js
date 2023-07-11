const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const UserModel = require("../models/user");
const  ValidationError  = require("../Errors/validation");


const ejs = require("ejs");
const { validate } = require('../middlewares/index');

const NotFoundError = require("../Errors/notFound");
const  transporter  = require("../config/emailConfig");
const path = require('path');


const fs = require('fs');
const {RegisterSchema,
  LoginSchema} = require("../Schema/schema")



class UserController {
    static userRegistration = async (req, res) => {
        const { name, email, password, password_confirm, tc } = req.body; //req.body - froontend se data aa rha hai 
        const user = await UserModel.findOne({ email: email })
        if (user) throw new ValidationError("Email already exists")
        else {
            if (name && email && password && password_confirm && tc) {
                if (password === password_confirm) {
                    try {
                        const salt = await bcrypt.genSalt(12);
                        const hashedPassword = await bcrypt.hash(password, salt);

                        const savedUser = new UserModel({
                            name: name,  //frontend vaala name database mein jaayega right one is from frontend 
                            email: email,
                            password: hashedPassword,
                            tc: tc
                        })

                        await savedUser.save();
                        const existingUser = await UserModel.findOne({ email: email })
                        //generate jwt token
                        const token = jwt.sign({ userId: existingUser._id }, process.env.SECRET_KEY, { expiresIn: '30d' });

                        //send email
                        res.status(200).send({
                            data: {
                                name: savedUser?.name || "",
                                email: savedUser?.email || "",
                                password: savedUser?.password || "",
                                "token": token,
                            },
                            message: "Registration successful",

                        });
                    }
                    catch (error) {
                        res.send({ "status": "failed", "message": "Unable to register" })
                    }
                } else {
                    throw new ValidationError("Password and password_confirm does not match")
                }

            } else {
              throw new ValidationError("Password and password_confirm do not match");
            }
          } else {
            throw new ValidationError("All fields are required");
          }
        } catch (error) {
          res.status(400).json({ status: "failed", message: error.message });
        }
      };
      

      static userLogin = async (req, res) => {
        try {
          const { email, password } = validate(LoginSchema , req.body)
          if (!email || !password) {
            throw new ValidationError("Email and password are required");
          }
    
          const user = await UserModel.findOne({ email: email });
          if (!user) {
            throw new ValidationError("User not found");
          }
    
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            throw new ValidationError("Invalid credentials");
          }
    
          // Generate JWT token
          const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: "30d",
          });
         
          res.status(200).send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Successful</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f5f5f5;
      }
      .container {
        text-align: center;
      }
      h1 {
        font-size: 32px;
        margin-bottom: 20px;
      }
      p {
        font-size: 18px;
        color: #888;
        margin-bottom: 20px;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        font-size: 18px;
        font-weight: bold;
        text-decoration: none;
        color: #fff;
        background-color: #007bff;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Login Successful</h1>
      <p>Welcome back!</p>
      <a href="/" class="button">Go to Homepage</a>
    </div>
  </body>
  </html>
`);

        } catch (error) {
          
            // Handle specific validation errors
            res.status(400).json({ status: "failed", message: error.message });
          
        }
      };
  
    static changePassword = async (req, res) => {
        try {
          const { password, password_confirm } = req.body;
      
          // Check if passwords match
          if (password !== password_confirm) {
            return res.status(400).json({ status: "failed", message: "Password and confirm password do not match" });
          }
      
          // Fetch the token from the request header
          const token = req.session.token;
      
          // Verify the token or handle as per your existing token verification logic
          // For example, if you have a separate function to verify the token
          // you can pass the token to that function for verification
          const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
          const userId = decodedToken.userId;
      
          // Find the user by the authenticated token
          const user = await UserModel.findById(userId);
          if (!user) {
            throw new NotFoundError('User not found');
          }
      
          // Hash the new password
          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(password, salt);
      
          // Update the user's password
          user.password = hashedPassword;
          await user.save();
      
          res.status(200).json({ status: "success", message: "Password changed successfully" });
        } catch (error) {
          res.status(500).json({ status: "failed", message: "Unable to change password" });
        }
      }
      

    static loggedUser = async (req, res) => {
        res.send({ "user": req.user });
    }


static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
  
    if (email) {
      const user = await UserModel.findOne({ email: email });
  
      if (!user) {
        return res.status(400).send({ status: "failed", message: "Email does not exist ..Please register your email first" });
      }
  
      const secret = user._id + process.env.SECRET_KEY;
      const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "15m" });
      const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`;
      const resetLink = `<a href="${link}">Reset Password</a>`;
  
      // Send email asynchronously
      transporter.sendMail(
        {
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Blog website password reset link",
          html: `
            <html>
              <head>
                <meta charset="UTF-8" />
                <title>Password Reset</title>
                <style>
                  a {
                    color: #007bff;
                    text-decoration: underline;
                  }
                </style>
              </head>
              <body>
                <h1>Password Reset</h1>
                <p>Hello,</p>
                <p>You have requested to reset your password. Click the link below to proceed:</p>
                ${resetLink}
                <p>If you didn't request this password reset, please ignore this email.</p>
              </body>
            </html>
          `
        },
        (error, info) => {
            if (error)  res.status(500).send({ message: "Error in sending email" });   
        }
      );
  
      res.status(200).send({ data: link, message: "Password reset email sent. Please check your email." });
    } else {
      res.status(400).send({ status: "failed", message: "Email is required" });
    }
  };
  
    static userPasswordReset = async(req,res)=>{
        const {password , password_confirmation} = req.body;
        const {id , token} = req.params;
        const user = await UserModel.findById(id);
        const new_secret = user._id + process.env.SECRET_KEY;
        try {
            jwt.verify(token , new_secret)
            if(password && password_confirmation){
          if(password === password_confirmation){
            const salt = await bcrypt.genSalt(12)
            const newhashedPassword = await bcrypt.hash(password, salt)
            await UserModel.findByIdAndUpdate(id, {
                $set: {
                    password: newhashedPassword
                }
            });
            res.send({"status" : "success" , message : "Password reset successfully"})
          }else{
            res.send({"status":"failed" , message:"Password and password confirmation does not match"})
          }
            }else{
                res.send({"status":"failed" , message:"All fields are required"})
            }
            
        } catch (error) {
            res.send("Invalid token")
            
        }
    }

}



module.exports = UserController;
