const router = require('express').Router();
const secret = 'scadsfdsfdvdsvssdasa';
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (userDoc) {
      const passok = bcrypt.compareSync(password, userDoc.password);
      if (passok) {
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to generate token' });
          } else {
            res.cookie('token', token).json({
              id: userDoc._id,
              username,
              role: userDoc.role,
            });
          }
        });
      } else {
        res.status(400).json({ error: 'Wrong credentials' });
      }
    } else {
      res.status(400).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;