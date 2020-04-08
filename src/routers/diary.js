const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth')
const Diary = require('../models/diary');

router.post('/diaries', auth, async (req,res) => {
  const diary = new Diary({
    ...req.body,
    owner:req.user._id
  });
  try {
    await diary.save()
    res.status(201).send(diary)
  } catch (error) {
    res.status(400).send(error)
  }
});

router.get('/diaries', auth, async (req,res) => {
  try {
    await req.user.populate('diaries').execPopulate()
    res.status(200).send(req.user.diaries)
  } catch (error) {
    res.status(500).send(error)
  }
});

router.get('/diaries/:id', auth, async (req,res) => {
  const _id = req.params.id
  try {
    const diary = await Diary.findOne({_id,owner:req.user._id})
    if(!diary) {
      return res.status(404).send()
    }
    res.status(200).send(diary)
  } catch (error) {
    res.status(500).send()
  }
});

router.patch('/diaries/:id', auth,async(req,res) => {
  const allowedUpdates = ['date','content'];
  const _id = req.params.id;
  const updateKey = Object.keys(req.body);
  const isValidUpdate = updateKey.every((update) => {
    return allowedUpdates.includes(update)
  })

  if (!isValidUpdate) {
    return res.status(400).send()
  }
  try {
    const diary = await Diary.findOne({_id,owner:req.user._id})
    if(!diary) {
      return res.status(404).send()
    }
    updateKey.forEach((update) => diary[update] = req.body[update])
    await diary.save()
    res.status(200).send(diary)
  } catch (error) {
    res.status(500).send()
  }
  
})

router.delete('/diaries/:id', auth, async (req,res) => {
  const _id = req.params.id;
  try {
    const diary = await Diary.findOneAndDelete({_id,owner:req.user._id})
    if(!diary) {
      return res.status(404).send()
    }
    res.status(200).send(diary)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router;