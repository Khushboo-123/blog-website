const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role",
      },
    name: {
        type: String,
        required: true,
        trim: true,

    },
    email: {
        type: String,
        required: true,
        trim: true,

    },
    password: {
        type: String,
        required: true,
        trim: true,

    },
    tc: {
        type: Boolean,
        default:false,
        required:true,

    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'],
      },
},

{
    timestamps: true,
  }
)

const UserModel = new mongoose.model("user" , userSchema);
module.exports = UserModel;