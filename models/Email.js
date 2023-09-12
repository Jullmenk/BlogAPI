const mongoose = require('mongoose')
const {Schema,model}=mongoose
const EmailSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    }    
},{timestamps:true})

const EmailModel = model("Email",EmailSchema)

module.exports = EmailModel