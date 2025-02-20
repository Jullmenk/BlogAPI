const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);  
    const userDoc = await User.create({
      username,
      password: hashedPassword, // Use the hashed password
      role,
    });
    res.json(userDoc);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

module.exports = router;
