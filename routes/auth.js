const router = require('express').Router()

const user = require('../models/User')

//Registering
router.post("/register",async(req,res)=>{
    try {
        const newUser = await {
            username:req.body.username,
            email:req.body.email,
            password:req.body.password,
        }
        
        const user = await newUser.save();
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err)
    }
})
//Login

module.exports = router