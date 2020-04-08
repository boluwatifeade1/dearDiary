const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: new Date()
  },

  content: {
    type: String,
    trim: true,
    required: true
  },

  owner: {
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
  }
});

const Diary = mongoose.model('Diary', diarySchema);

module.exports = Diary;