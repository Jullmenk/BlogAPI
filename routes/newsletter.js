const router = require('express').Router()
const {newsletter} = require('../controllers/newsletterControllers')
  
router.post("/",newsletter)
module.exports = router