
const mongoose = require('mongoose')
const schema = mongoose.Schema
const Joi=require('joi')

const userValidation=Joi.object({
    userName:Joi.string().required().min(3).trim(),
    email:Joi.string().email().required().trim(),
    password:Joi.string().optional().min(4).trim(),
    profilePic:Joi.string().optional().trim()
})

const loginValidation=Joi.object({
    email:Joi.string().email().required().trim(),
    password:Joi.string().required().min(4).trim(),
})

const UserSchema = new schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profilePic: {
        type: String,


    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    isAdmin:{
        type:String,
        default:"user"
    }
});

const UserModel=mongoose.model('user',UserSchema)
module.exports={UserModel,userValidation,loginValidation}