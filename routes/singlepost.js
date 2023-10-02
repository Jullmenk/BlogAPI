const router = require('express').Router()
const Post = require('../models/Post')
const multer = require('multer')
const upload = multer({dest:'uploads/'})
const {cloudinary} = require('../Utils/cloudinary');
const {sendtouser} = require('../controllers/newsletterControllers')

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
    sendtouser(req,res,uploadResponse.url)
     console.log('Response data:', postDoc); 
     res.status(200).json(postDoc)
    } catch (error) {
      console.log(error)
      res.status(500).json({err:`Error: ${error}`})
    }
    
})

router.put('/',upload.single('file'),async (req,res)=>{
  try {
    const {title,summary,content,category,file,postlink,pagetodelete} = req.body
    const imgdif = await Post.findById(pagetodelete)
    let newData = {}
    let uploadResponse = {}
    if(file!==imgdif.cover){
       uploadResponse = await cloudinary.uploader.upload(file,{
        upload_preset:'posts'
      })
       newData = {
        title,
        summary,
        content,
        category,
        postlink,
        cover:uploadResponse.url,
      }
    }
    else{
       newData = {
        title,
        summary,
        content,
        category,
        postlink,
        cover:file,
      }
    }

    const find = await Post.findByIdAndUpdate(pagetodelete,newData,{new:true})
     console.log('Response data:', newData); 
     res.status(200).json(newData)
    } catch (error) {
      console.log(error)
      res.status(500).json({err:`Error: ${error}`})
    }
    
})
  router.delete('/', async (req, res) => {
    const { pagetodelete } = req.body;
    try {
      const post = await Post.findByIdAndDelete(pagetodelete);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const imgid = post.cover;
      console.log(post);
      if (imgid) {
        await cloudinary.uploader.destroy(imgid);
      }
      console.log('Deletion successful');
      res.status(200).json({ message: 'Deletion successful' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


module.exports = router