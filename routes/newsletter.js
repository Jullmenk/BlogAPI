const router = require('express').Router()
const handlebars = require('handlebars')
const Email = require('../models/Email')
const nodemailer = require('nodemailer');
const fs = require('fs')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail'
    auth: {
      user: process.env.EMAIL_USER, // your email address
      pass: process.env.EMAIL_KEY_SECRET, // your email password
    },
  });

  
router.post("/",async(req,res)=>{
    const {useremail} = req.body
  
    try {
      const currentDate = new Date().getFullYear()
      const emailDoc = await Email.create({email:useremail})
      const atIndex = useremail.indexOf('@');
      const currentYear = await new Date().getFullYear();
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


module.exports = router