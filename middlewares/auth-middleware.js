const jwt = require('jsonwebtoken');

const UserModel = require('../models/user');

let checkUserAuth = async(req,res ,next)=>{
    try {
        const bearerHeader = req.headers["authorization"] || "";
    const [bearer, bearerToken] = bearerHeader.split(" ");
  
    if (!bearerToken) {
      return res
        .status(401)
        .json({ status: false, data: null, message: "Unauthorized" });
    } else {
        const {userId} = jwt.verify(bearerToken, process.env.SECRET_KEY);
            
        //Get user from token 
        req.user = await UserModel.findById(userId).select('-password');
        console.log(req.user)
        next();
    }
    } catch (error) {
        res.status(401).json({
            status: false,
            data: null,
            message: "Unauthorized Access",
          });
        
    }    

}

module.exports = checkUserAuth;