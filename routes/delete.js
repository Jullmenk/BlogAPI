const router = require('express').Router()
const Post = require('../models/Post')
router.delete('/', async (req,res)=>{
    const {pagetodelete} = req.body
    try {
        console.log(pagetodelete)
        const deleting = await Post.findById(pagetodelete)
        const deleteSuccessful = await Post.deleteOne({ _id: pagetodelete })
        if (deleteSuccessful){
          console.log(deleteSuccessful,'was succesfull deleted')
        }
        console.log(deleting)
    } catch (error) {
      console.log(error)
      res.status(404).json({err:error})
    } 
})

module.exports = router