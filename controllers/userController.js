const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const UserModel = require("../models/user");
const ValidationError = require("../Errors/validation");
const NotFoundError = require("../Errors/notFound");
const  transporter  = require("../config/emailConfig");


//data aa rha hai usse handle krna hai 
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
                        res.status(400).json({ status: "failed", message: error.message });
                    }
                } else {
                    throw new ValidationError("Password and password_confirm does not match")
                }

            } else {
                res.send({ "status": "failed", "message": "All fields are required" })

            }
        }
    }

    static userLogin = async (req, res) => {
        const { email, password } = req.body;
        if (email && password) {
            const user = await UserModel.findOne({ email: email });
            if (user != null) {
                const isMatch = await bcrypt.compare(password, user.password);
                if ((user.email === email) && isMatch) {
                    //generate jwt token

                    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '30d' })
                    res.status(200).send({
                        data: {
                            name: user.name,
                            email: user.email,
                            token,

                        },
                        message: 'Login successful',
                    });
                } else {
                    res.send({
                        'status' : "failed",
                        message: "Email or password is wrong!"
                    })
                }

            } else {
                res.send({"status" :"failed" , message:"You are not registered...Please register first with your credentiaks"})
            }
        } else {
            res.send({
                data: error,
                message: "All fields required"
            })

        }

    }

    static changePassword = async (req, res) => {
        const { password, password_confirm } = req.body;
        if (password && password_confirm) {
            if (password !== password_confirm) {
                return res.status(400).json({ status: "failed", message: "Password and confirm password does not match" });
            }
            else {
                const salt = await bcrypt.genSalt(12)
                const newhashedPassword = await bcrypt.hash(password, salt)
                await UserModel.findByIdAndUpdate(req.user._id, {
                    $set: {
                        password: newhashedPassword
                    }
                })
                res.send({ "status": "succes", message: "Password changed successfully" })

            }

        } else {
            res.send({ "status": "failed", message: "All fields are required" })
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
