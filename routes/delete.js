const router = require('express').Router();
const Post = require('../models/Post');
const {cloudinary} = require('../Utils/cloudinary');

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

module.exports = router;