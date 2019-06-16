const express = require('express');
const router = express.Router();
const User = require('../../Model/user')
const {check, validationResult} = require('express-validator/check')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
router.post('/', [
  check('name','Please enter your name').not().isEmpty(),
  check('email','Please enter a valid email').isEmail(),
  check('password','Please enter a valid password').isLength({min:6})
], async (req,res)=>{
  const error = validationResult(req);
  if(!error.isEmpty()){
    return res.status(400).json({
      errors:error.array()[0].msg
    });
  }
  console.log(req.body.name);
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;

  try{
    let user = await User.findOne({email});
    //check for existing user
    if(user){
      return res.status(400).json({errors:[{msg:'User has already existed'}]});
    }
    //get user gravatar
    const avatar = gravatar.url(email,{
      s:'200',
      r:'pg',
      d:'mm'
    })
    //create new user
    user = new User({
      name,
      email,
      avatar,
      password
    });
    //encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password,salt);
    await user.save();
    //return jwt
    const payload = {
      user : {
        id: user.id
      }
    };
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {expiresIn:36000},
      (err,token)=>{
        if(err) throw err;
        res.json({token});
      }
    );
  }catch(err){
    res.status(500).send('Server error');
  }

});


module.exports =  router;
