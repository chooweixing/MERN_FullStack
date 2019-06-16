const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('config');
const auth = require('../../Middleware/auth');
const User = require('../../Model/user');
const Post = require('../../Model/post');
const {check,validationResult} = require('express-validator/check');

router.get('/',(req,res)=>{
  res.send("Post is here");
})

//create a post
router.post('/',[auth,
  [
    check("text","Text is a required field").not().isEmpty()
  ]
], async (req,res)=>{
  const error = validationResult(req);
  if(!error.isEmpty()){
    res.status(400).json({errors:error.array()
    });
  }
  try{
    const user = await User.findById(req.user.id)
    const post = new Post({
      text : req.body.text,
      name : user.name,
      avatar: user.avatar,
      user: req.user.id
    });
    await post.save();
    res.status(200).json(post);
  }catch(err){
    res.status(400).send("Server error");
  }
});
//get all post
router.get('/posts', async(req,res)=>{
  try{
    const posts = await Post.find();
    res.status(200).json(posts);
  }catch(err){
    res.status(400).send("Server error");
  }
});

//get individual post
router.get('/posts/:id', async(req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({msg:"This post does not exist"});
    }
    res.status(200).json(post);
  }catch(err){
    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg:"This post does not exist"});
    }
    res.status(400).send("Server error");
  }
});
//delete individual post
router.delete('/posts/:id',auth, async(req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({msg:"This post does not exist"});
    }
    if(req.user.id !== post.user.toString()){
      return res.status(401).json({msg:"You are not authorised to delete the post"});
    }
    await Post.findOneAndRemove(req.params.id);
    res.status(200).send("Post is deleted");
  }catch(err){
    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg:"This post does not exist"});
    }
    res.status(400).send("Server error");
  }
});

//adding likes to a post
router.put('/like/:id',auth,async (req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({msg:"This post does not exist"});
    }
    if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
      return res.status(400).json({msg:"The post already like by you!"})
    }
    post.likes.unshift({user:req.user.id});
    await post.save();
    res.json(post);
  }catch(err){
    console.error(err);
    res.status(400).send("Server error");
  }
});
//adding unlike to a post
router.put('/unlike/:id',auth,async (req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({msg:"This post does not exist"});
    }
    if(post.likes.filter(like=>like.user.toString()===req.user.id).length===0){
      return res.status(400).json({msg:"The post is not like by you!"})
    }
    const postIndex = post.likes.map(like=>like.user.toString().indexOf(req.user.id));
    post.likes.splice(postIndex,1);
    await post.save();
    res.json(post);
  }catch(err){
    console.error(err);
    res.status(400).send("Server error");
  }
});
module.exports=router
