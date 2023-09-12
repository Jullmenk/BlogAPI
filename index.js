const express = require("express");
const app = express();
require('dotenv').config()
const PORT = process.env.PORT || 3001;
const User = require('../API/models/User')
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
const Post =  require('../API/models/Post')
const nodemailer = require('nodemailer');
const BASE_URL = process.env.BASE_URL
app.use(cors({
  credentials: true,
  origin:BASE_URL
}))
  
app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(__dirname + '/uploads'))



mongoose.connect(process.env.DATABASE)

//Code for register
app.post('/Register',upload.single('file'),async (req,res)=>{
  const {originalname,path} = req.file
  const parts = originalname.split('.')
  const ext = parts[parts.length-1]
  const newPath = path+'.'+ext
  fs.renameSync(path,newPath)
  const {username,password} = req.body
  try {
    const userDoc = await User.create({
    username,
    password:bcrypt.hashSync(password,salt),
    cover:newPath,
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
    const emailDoc = await Email.create({email:useremail})
    const atIndex = useremail.indexOf('@');
    const currentYear = new Date().getFullYear();
    const name = useremail.slice(0, atIndex)
    const mailOptions = {
      from: 'caliamagao@gmail.com', // Sender's email address
      to: useremail, // Recipient's email address (you can use the provided email or a different one)
      subject: 'Bem-vindo a nossa Comunidade', // Email subject
      html: `
      <p>Ola ${name},</p>
      <p>Estamos muito feliz por te ter por aqui e estamos a enviar este email para confirmar que a sua subscrição ao nosso website foi bem sucedida.</p>
      <p>CALIAMAG ${currentYear}</p>
    `,
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

//get Post files
app.post('/post',upload.single('file'),async (req,res)=>{
  const {originalname,path} = req.file
  const parts = originalname.split('.')
  const ext = parts[parts.length-1]
  const newPath = path+'.'+ext
  fs.renameSync(path,newPath)
  const {title,summary,content,category} = req.body
  const postDoc = await Post.create({
    title,
    summary,
    content,
    category,
    cover:newPath,
  })
   console.log('Response data:', postDoc); 
   res.json(postDoc)
})

app.get('/post', async (req,res)=>{
  res.json(await Post.find().sort({createdAt:-1}))
})


app.get('/post/:id',async(req,res)=>{
  const {id} = req.params
  const postDoc= await Post.findById(id)
  res.json(postDoc)
})

app.listen(PORT, () => {
  console.log("Backend is runningggg int the port:",PORT);
});

 