const Profile = require('../../Model/profile');
const User = require('../../Model/user');
const express = require('express');
const router = express.Router();
const auth = require('../../Middleware/auth');
const {check,validationResult} = require('express-validator/check');

//Login and display own profile
router.post('/me',auth, async(req,res)=>{
  try{
    console.log(req.user)
    const profile = await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
    if(!profile){
      res.status(400).json({
        msg: 'No exisiting profile'
      })
    }
    res.status(200).json(profile);
  }catch(err){
    console.log(err)
    res.status(500).send('Server error');
  }
});
//list out all profile
router.get('/allProfile',async (req,res)=>{
  try{
    const profiles = await Profile.find().populate('user',['name','avatar']);
    res.json(profiles);
  }catch(err){
    res.status(500).send("Server error")
  }
});
//list profile by user id
router.get('/user/:id',async (req,res)=>{
  try{
    const profile = await Profile.findOne({user:req.params.id}).populate('user',['name','avatar']);
    res.json(profile);
  }catch(err){
    res.status(500).send("Server error")
  }
});
//delete profile by user id
router.delete('/',auth,async (req,res)=>{
  try{
    await Profile.findOneAndRemove({user:req.user.id});
    await User.findOneAndRemove({_id:req.user.id});
    res.send("User is delete");
  }catch(err){
    res.status(500).send("Server error")
  }
});
//login and create/update profile
router.post('/', [auth,
  [
    check('status','Status is required').not().isEmpty(),
    check('skills','Skill is required').not().isEmpty()
  ]
],async (req,res)=>{
  const err = validationResult(req);
  if(!err.isEmpty()){
    res.status(400).json({
      errors:err.array()
    });
  }
  const {
    company,
    website,
    location,
    bio,
    status,
    skills,
    githubusername,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body;

  const profileFields = {};
  profileFields.user = req.user.id;
  if(company) profileFields.company = company;
  if(website) profileFields.website = website;
  if(bio) profileFields.bio = bio;
  if(status) profileFields.status = status;
  if(githubusername) profileFields.githubusername = githubusername;
  if(location) profileFields.location = location;
  if(skills){
    profileFields.skills =skills.split(',').map(skill=>skill.trim());
  }
  profileFields.social = {};
  if(youtube) profileFields.social.youtube = youtube;
  if(youtube) profileFields.social.twitter = twitter;
  if(youtube) profileFields.social.facebook = facebook;
  if(youtube) profileFields.social.linkedin = linkedin;
  if(youtube) profileFields.social.instagram = instagram;
  try{
    let profile = await Profile.findOne({user:req.user.id});

    if(profile){
      await Profile.findOneAndUpdate({user:req.user.id},{$set:profileFields},{new:true});
      return res.status(201).json(profile);
    }
    profile = new Profile(profileFields);
    await profile.save();
    res.status(200).json(profile);
  }catch(err){
    console.log(err.message);
    res.status(500).send("Server error")
  }
});


module.exports = router
