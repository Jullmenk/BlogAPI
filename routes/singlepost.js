const router = require('express').Router()
const Post = require('../models/Post')
const multer = require('multer')
const upload = multer({dest:'uploads/'})
const {cloudinary} = require('../Utils/cloudinary');

router.get('/', async (req,res)=>{
  try {
    res.json(await Post.find().sort({createdAt:-1}))    
  } catch (error) {
    console.log(error)
    res.status(404).json({'err':error})
  }
})

router.get("/:id",async(req,res)=>{
  try {
    const {id} = req.params
    const postDoc= await Post.findById(id)
    postDoc.views += 1
    await postDoc.save();
    res.json(postDoc)
    
  }
  
    catch(error){
      console.log(error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
router.post('/',upload.single('file'),async (req,res)=>{
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

module.exports = router