const handlebars = require('handlebars')
const Email = require('../models/Email')
const nodemailer = require('nodemailer');
const fs = require('fs')
require('dotenv').config()
const Post = require('../models/Post')
const inLineCss = require('nodemailer-juice');


const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail'
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_KEY_SECRET, // your email password
  },
});

transporter.use('compile', inLineCss());

exports.newsletter = async(req,res)=>{

      const {useremail} = req.body
  
      try {
        const currentDate = new Date().getFullYear()
        const emailDoc = await Email.create({email:useremail})
        const atIndex = useremail.indexOf('@');
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
}

exports.sendtouser = async(req,res,img)=>{
  const {title,summary} = req.body
  const currentDate = new Date().getFullYear()
  const sendemail = await Email.find()
  const source = fs.readFileSync('message.html','utf-8').toString();
  const template = handlebars.compile(source)
  const match = await Post.findOne({title:title})
  sendemail.forEach( async (elem)=>{
        const atIndex = elem.email.indexOf('@');
        const name = elem.email.slice(0, atIndex)
        const replacements = await {
          username:name,
          year:currentDate,
          imgtosend:img,
          titlepost:title,
          summary:summary,
          link:`https://caliamag.vercel.app/post/${match._id}`
        }
        const htmltosend = template(replacements)
        const mailOptions = {
          from: 'caliamagao@gmail.com', // Sender's email address
          to: elem.email, // Recipient's email address (you can use the provided email or a different one)
          subject:title, // Email subject
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
  })
}
