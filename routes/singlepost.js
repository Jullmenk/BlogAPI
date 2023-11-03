const router = require('express').Router()
const Post = require('../models/Post')
const multer = require('multer')
const upload = multer({dest:'uploads/'})
const {cloudinary} = require('../Utils/cloudinary');
const {sendtouser} = require('../controllers/newsletterControllers')
const Others = require('../models/Others')

router.get('/', async (req,res)=>{
  try {
   const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(9);

    // Create an array to store the latest 5 posts for each category
    const latestCategoryPosts = {};
    const categories = ['África', 'Europa', 'América', 'Oriente Médio', 'Ásia e Pacífico'];

    for (const category of categories) {
      const categoryPosts = await Post.find({ category }).sort({ createdAt: -1 }).limit(5);
      latestCategoryPosts[category] = categoryPosts;
    }
    const top4Posts = await Post.find().sort({ views: -1 }).limit(4);
    const postdoc = [latestPosts, latestCategoryPosts,top4Posts]
    res.json(postdoc);  
  }
     catch (error) {
    console.log(error)
    res.status(404).json({'err':error})
  }
})

router.get('/others', async (req,res)=>{
  try {
    res.json(await Others.find().sort({createdAt:-1}))    
  } catch (error) {
    console.log(error)
    res.status(404).json({'err':error})
  }
})

router.post('/',upload.single('file'),async (req,res)=>{
  try {
    const {title,summary,content,category,file,postlink} = req.body
    const uploadResponse = await cloudinary.uploader.upload(file,{
      upload_preset:'posts'
    })
    let meth;
    if(category==='Documentários'||category==='Entrevistas'||category==='Livros'||category==='Cursos'){
      meth=Others
    }
    else{
      meth=Post
    }
    const postDoc = await meth.create({
      title,
      summary,
      content,
      category,
      postlink,
      cover:uploadResponse.url,
    })
      sendtouser(req,res,uploadResponse.url)
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


  router.get('/:category', async (req,res)=>{
    const category = req.params.category;
    try {
       const categoryPosts = await Post.find( {category} ).sort({ createdAt: -1 });
      console.log(category)
      res.json(categoryPosts);  
    }
       catch (error) {
      console.log(error)
      res.status(404).json({'err':error})
    }
  })

  router.get('/page/:id',async(req,res)=>{
    try {
      const id = req.params.id
       const postDoc= await Post.findById(id)
        if (!postDoc) {
          console.log('not found')
          return res.status(404).json({ error: 'Post not found' });
        }
        const categoryPosts = await Post.find({ category:postDoc.category }).sort({ createdAt: -1 }).limit(18);
          postDoc.views += 1
         await postDoc.save();
        const postDetail = await [postDoc,categoryPosts]
      res.status(200).json(postDetail)
    }
      catch(error){
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    router.get('/search/:searchs', async (req,res)=>{
      const searched = req.params.searchs;
      try {
        const searchs = await searched.toLowerCase()
        const found = await Post.find({
          $or: [
            { title: { $regex: searchs, $options: 'i' } },
            { content: { $regex: searchs, $options: 'i' } }
          ]
        }).sort({ createdAt: -1 });        
        res.json(found);  
      }
         catch (error) {
        console.log(error)
        res.status(404).json({'err':error})
      }
    })
  


  
  
  
module.exports = router