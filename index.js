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
const registerRoute = require('./routes/register')
const loginroute = require('./routes/loginRoute')
const messageRouter = require('./routes/message')

app.use(cors({
  credentials: true,
   origin:process.env.BASE_URL
  //origin:'http://localhost:3000'
}))
app.use(express.json( {limit: '50mb'}))
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser())
app.use('/uploads',express.static(__dirname + '/uploads'))
mongoose.connect(process.env.DATABASE)



app.use('/Register',registerRoute)
app.use('/newsletter', newsletterRoute)
app.use('/connected',connectRoute)
app.use('/logout',logoutRouter)
app.use('/post',singlepostRouter)
app.use('/login',loginroute)
app.use('/message',messageRouter)


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Backend is runningggg int the port:",PORT);
});

 
