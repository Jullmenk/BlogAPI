const mongoose = require('mongoose')
const {Schema,model} = mongoose

const PostSchema = new Schema({
title:String,
summary:String,
content:String,
cover:String,
category:String,
postlink:String,
views: { type: Number, default: 0 },
},{timestamps:true})

const PostModel = model("Post",PostSchema)

module.exports = PostModel