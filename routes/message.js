const router = require('express').Router()
const nodemailer = require('nodemailer');
const {cloudinary} = require('../Utils/cloudinary');
const Email = require('../models/Email')
const fs = require('fs')
require('dotenv').config()
const handlebars = require('handlebars')


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_KEY_SECRET, 
    },
  });


router.post('/',async (req,res)=>{
    const {name,email,message,title} = req.body
    try {
        const mailOptions = {
            from: 'caliamagao@gmail.com',
             to: 'caliamag@proton.me', 
            subject: title,
            html:`
            <p>Esse email está a ser enviado por: ${name}</p>
            <p>Email: ${email}</p>
            <strong>Tema da mensagem: ${title}</strong>
            <p></p>
            <strong>Em seguida a mensagem:</strong>
            <p>${message}</p>
            `, 
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
              res.status(500).json({ message: 'Error sending email' });
            } else {
              console.log('Email sent:', info.response);
              res.status(200).json({ message: 'Newsletter subscription successful' });
            }
          });

        console.log(name,email,message)
        res.status(200).json(req.body)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }

})

router.post('/emails',async(req,res)=>{
      const {title,message,file} = req.body
  try {
    const uploadResponse = await cloudinary.uploader.upload(file,{
      upload_preset:'posts'
    })
    const currentDate = new Date().getFullYear()
    const sendemail = await Email.find()
    const source = fs.readFileSync('message.html','utf-8').toString();
    const template = handlebars.compile(source)
    sendemail.forEach( async (elem)=>{
          const atIndex = elem.email.indexOf('@');
          const name = elem.email.slice(0, atIndex)
          const replacements = await {
            username:name,
            year:currentDate,
            imgtosend:uploadResponse.url,
            titlepost:title,
            summary:message,
            link:`https://caliamag.vercel.app`
          }
          const htmltosend = template(replacements)
          const mailOptions = {
            from: 'caliamagao@gmail.com',  
            to: elem.email, 
            subject:title, 
            html:htmltosend, 
          };
 
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
              res.status(500).json({ message: 'Error sending email' });
            } else {
              console.log('Email sent:', info.response);
              res.status(200).json({ message: 'Newsletter subscription successful' });
            }
          });
    })
  } catch (error) {
      console.log(error)
  }
})

router.get('/', async (req,res)=>{
  try {
    res.json(await Email.find().sort({createdAt:-1}))    
  } catch (error) {
    console.log(error)
    res.status(404).json({'err':error})
  }
})

module.exports = router
