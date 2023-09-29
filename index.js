const express = require("express");
const app = express();
require('dotenv').config()
const cors = require('cors');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser')
const newsletterRoute = require('./routes/newsletter')
const singlepostRouter = require('./routes/singlepost')
const logoutRouter = require('./routes/logout')
const connectRoute = require('./routes/connected')
// const loginRouter = require('./routes/login')
const registerRoute = require('./routes/register')
const loginroute = require('./routes/loginRoute')
const deleteRoute = require('./routes/delete')
const messageRouter = require('./routes/message')


app.use(cors({
  credentials: true,
  origin:'https://caliamagfront-jullmenk.vercel.app'
  // origin:'http://localhost:3000'
}))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(__dirname + '/uploads'))
mongoose.connect(process.env.DATABASE)
app.use('/Register',registerRoute)
app.use('/newsletter', newsletterRoute)
// app.use('/login',loginRouter)
app.use('/connected',connectRoute)
app.use('/logout',logoutRouter)
app.use('/post',singlepostRouter)
app.use('/login',loginroute)
app.use('/todelete',deleteRoute)
app.use('/message',messageRouter)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Backend is runningggg int the port:",PORT);
});

 
