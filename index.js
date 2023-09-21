const express = require("express");
const app = express();
require('dotenv').config()
const PORT = process.env.PORT || 3001;
const User = require('./models/User')
const Email = require('./models/Email')
const cors = require('cors');
const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt')
const salt = bcrypt.genSaltSync(10)
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const secret = 'scadsfdsfdvdsvssdasa'
const multer = require('multer')
const upload = multer({dest:'uploads/'})
const fs = require('fs')
const Post =  require('./models/Post')
const nodemailer = require('nodemailer');
const handlebars = require('handlebars')
const {cloudinary} = require('./Utils/cloudinary');
const BASE_URL = process.env.BASE_URL


app.use(cors({
  credentials: true,
  // origin:'http://localhost:3000'
  origin:BASE_URL,
}))
  
app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(__dirname + '/uploads'))



mongoose.connect(process.env.DATABASE)

//Code for register
app.post('/Register',upload.single('file'),async (req,res)=>{
  const {username,password,role} = req.body
  try {
    const userDoc = await User.create({
    username,
    password:bcrypt.hashSync(password,salt),
    role,
    })
    res.json(userDoc)
  } catch (err) {
    res.status(400).json(err)
  }
})

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail'
  auth: {
    user: 'caliamagao@gmail.com', // your email address
    pass: 'ehvrnejyhsexbazc', // your email password
  },
});


app.post('/newsletter', async (req,res)=>{
  const {useremail} = req.body
  
  try {
    const currentDate = new Date().getFullYear()
    const emailDoc = await Email.create({email:useremail})
    const atIndex = useremail.indexOf('@');
    const currentYear = new Date().getFullYear();
    const name = useremail.slice(0, atIndex)
    const source = fs.readFileSync('emailtemplate.html','utf-8').toString();
    const template = handlebars.compile(source)
    const replacements = {
      username:name,
      year:currentDate,
    }
    const htmltosend = template(replacements)
    const mailOptions = {
      from: 'caliamagao@gmail.com', // Sender's email address
      to: useremail, // Recipient's email address (you can use the provided email or a different one)
      subject: 'Bem-vindo a nossa Comunidade', // Email subject
      html:htmltosend, 
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Newsletter subscription successful' });
      }
    });
  } catch (error) {
    res.status(400).json(error)
  }
})


//Code for Login
app.post('/Login',async (req,res)=>{
  const {username,password}= req.body
  try {
    const userDoc = await User.findOne({username})
    if (userDoc){
      const passok = bcrypt.compareSync(password,userDoc.password)
      if(passok){
         jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
          if(err) throw err;
          res.cookie("token",token).json({
            id:userDoc._id,
            username,
            role:userDoc.role,
          })
        })
      }else{
        res.status(400).json("Wrong credentials")
      }
    } else{
      res.status(400).json("user not found")
    }
    } catch (err) {
    res.status(400).json(err)
  }
})

//Read the cookies
app.get('/connected',(req,res)=>{
  const {token} = req.cookies
  jwt.verify(token,secret,{},(err,info)=>{
    if(err) throw err;
    res.json(info)
  })
})
//Logout
app.post('/logout',(req,res)=>{
  res.cookie('token','').json('ok')
})

//function to get the Post files from the front
app.post('/post',upload.single('file'),async (req,res)=>{
  try {
  const {title,summary,content,category,file} = req.body
  const uploadResponse = await cloudinary.uploader.upload(file,{
    upload_preset:'posts'
  })

  const postDoc = await Post.create({
    title,
    summary,
    content,
    category,
    cover:uploadResponse.url,
  })
   console.log('Response data:', postDoc); 
   res.status(200).json(postDoc)
  } catch (error) {
    console.log(error)
    res.status(500).json({err:`Error: ${error}`})
  }
  
 })


 //function to find all the post and send to the front
app.get('/post', async (req,res)=>{
  res.json(await Post.find().sort({createdAt:-1}))
})


app.get('/post/:id',async(req,res)=>{
  try {
  const {id} = req.params
  const postDoc= await Post.findById(id)
  postDoc.views += 1
  await postDoc.save();
  res.json(postDoc)}
  catch(error){
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.listen(PORT, () => {
  console.log("Backend is runningggg int the port:",PORT);
});

 