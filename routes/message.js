const router = require('express').Router()
const nodemailer = require('nodemailer');

require('dotenv').config()

const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail'
    auth: {
      user: process.env.EMAIL_USER, // your email address
      pass: process.env.EMAIL_KEY_SECRET, // your email password
    },
  });


router.post('/',async (req,res)=>{
    const {name,email,message,title} = req.body
    try {
        const mailOptions = {
            from: 'caliamagao@gmail.com', // Sender's email address
             to: 'caliamag@proton.me', // Recipient's email address (you can use the provided email or a different one)
           // to: 'julinolady@gmail.com', 
            subject: title, // Email subject
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

module.exports = router