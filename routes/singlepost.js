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

  router.get("/share/:id",async(req,res)=>{
    try {
      const {id} = req.params
      const postDoc= await Post.findById(id)
      res.status(200).send(`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="${postDoc.summary}">
          <title>${postDoc.title}</title>
          
          </head>
      </html>
      `).contentType('text/html')
    }
      catch(error){
        res.status(404).send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Something went wrong</title>
            
            </head>
        </html>
        `).contentType('text/html')
      }
  })



router.post('/',upload.single('file'),async (req,res)=>{
  try {
    const {title,summary,content,category,file,postlink} = req.body
    const uploadResponse = await cloudinary.uploader.upload(file,{
      upload_preset:'posts'
    })
  
    const postDoc = await Post.create({
      title,
      summary,
      content,
      category,
      postlink,
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