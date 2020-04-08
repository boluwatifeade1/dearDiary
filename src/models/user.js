const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = "dearDiary";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },

  age: {
    type: Number,
    validate(value) {
      if (value < 0 ) {
        throw new Error('Age must be a positive number')
      }
    }
  },

  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      } 
    }
  },

  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if(value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"')
      }
    }
  },

  tokens:[
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
});

userSchema.virtual('diaries',{
  ref:'Diary',
  localField:'_id',
  foreignField:'owner'
})

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  return userObject
}
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({_id:user._id.toString() },secret)
  user.tokens = user.tokens.concat({token})
  await user.save()
  return token
}

userSchema.statics.findByCredentials = async (email,password) => {
  const user = await User.findOne({email})
  if (!user) {
    throw new Error('Unable to Login')
  }
  const isMatch = await bcrypt.compare(password,user.password)
  if (!isMatch) {
    throw new Error('Unable to Login')
  }
  return user
}

userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password,8)
  }
  next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;