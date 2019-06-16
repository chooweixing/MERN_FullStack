const express = require('express');
const router = express.Router();
const auth = require('../../Middleware/auth');
const User = require('../../Model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config');
router.get('/',auth,(req,res)=>{
  res.send("Auth route")
});

router.post('/',async (req,res)=>{
  const {email,password} = req.body;
  try{
    let user = await User.findOne({email});
    if(!user){
      console.log('no valid user, ' + req.body)
      return res.status(400).json({
        errors : [{msg : "Invalid credentials"}]
      })
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      console.log('password mismatch')
      return res.status(400).json({
        errors : [{msg : "Invalid credentials"}]
      })
    }
    const payload = {
      user:{
        id: user.id
      }
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {expiresIn:36000},
      (err,token)=>{
        if(err) throw err;
        res.status(200).json({token:token});
      }
    )
  }catch(err){
      res.status(500).send('Server error');
    }
  });
module.exports = router;
