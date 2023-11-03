const mongoose = require('mongoose')
const {Schema,model} = mongoose

const OthersSchema = new Schema({
title:String,
summary:String,
content:String,
cover:String,
category:String,
postlink:String,
views: { type: Number, default: 0 },
},{timestamps:true})

const OthersModel = model("Others",OthersSchema)

module.exports = OthersModel