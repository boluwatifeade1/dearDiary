const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth')

// create user (signUp)
router.post('/users', async (req,res) => {
  const user = new User(req.body);
  try{
    const token = await user.generateAuthToken()
    await user.save()
    res.status(201).send({user,token})
  } catch (error) {
    res.status(400).send(error)
  }
});

// Log user's in
router.post('/users/login', async(req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findByCredentials(email,password)
    const token = await user.generateAuthToken()
    res.status(200).send({user,token})
  } catch(error) {
    res.status(400).send(error)
  }
})

router.post('/users/logout', auth, async(req,res) => {
  const user = req.user
  try {
    user.tokens = user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await user.save()
    res.status(200).send()
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/users/me', auth, async (req,res) => {
  res.status(200).send(req.user);
});

router.patch('/users/me', auth, async(req,res) => {
  const allowedUpdates = ['name','email','age','password'];
  const user = req.user
  const updateKey = Object.keys(req.body);
  const isValidUpdate = updateKey.every((update) => {
    return allowedUpdates.includes(update)
  })
  if (!isValidUpdate) {
    return res.status(400).send()
  }
  try {
    updateKey.forEach((update) => user[update] = req.body[update])
    await user.save()
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send(error)
  }
  
})

router.delete('/users/me', auth, async (req,res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  } catch (error) {
    res.status(500).send()
  }
})

module.exports = router;