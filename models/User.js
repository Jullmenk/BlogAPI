const mongoose = require('mongoose')
const {Schema,model}=mongoose
const UserSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true,
    }
},{timestamps:true})

const Usermodel = model("User",UserSchema)

module.exports = Usermodel