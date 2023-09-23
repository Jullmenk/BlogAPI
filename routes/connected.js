const router = require('express').Router()
const secret = 'scadsfdsfdvdsvssdasa'

router.get('/',async (req,res)=>{
    try {
        const {token} = req.cookies
        jwt.verify(token,secret,{},(err,info)=>{
          if(err) throw err;
          res.json(info)
        })       
    } catch (error) {
     res.status(404).json({'err:':error})   
    }
})

module.exports = router