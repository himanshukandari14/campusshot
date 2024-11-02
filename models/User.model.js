const mongoose = require("mongoose");

//default avatars
const defaultAvatars = [
  "../assets/defaltAvatars/DA1.jpg",
  "../assets/defaltAvatars/DA2.jpg",
  "../assets/defaltAvatars/DA3.jpg",
];
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 1,
    maxlength: [30, "Username cannot exceed 20 characters"],
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },
  profile: {
    type: String,
  },
  bio: {
    type: String,

    maxlength: [60, "Bio can't be short than 60 characters"],
  },
  password: {
    type: String,
    required: true,
    minLength: [8, "Password can't be short than 8 characters"],
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phoneNumber: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],

  stories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },
  ],

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  otp: {
    // New field for OTP
    type: String,
  },
  otpExpires: {
    // New field for OTP expiration
    type: Date,
  },
  isActive: {
    // New field to indicate if the user account is active
    type: Boolean,
    default: false, // Default to false until verified
  },
  forgetPasswordOtp: {
    type: String,
  },
  forgetPasswordExpires:{
    type: Date,
  },
  // New fields
  pronouns: {
    type: String,
    enum: ['he/him', 'she/her', 'they/them'], // Optional pronouns
  },
  department: {
     enum: ['BCA', 'BBA', 'B.Tech', 'BAJMC', 'B.Pharma', 'D.pharma'],
  },
  year: {
     enum: ['1st', '2nd', '3rd', '4th'],
  },
  avatar:{
    type:String,
    default:function(){
      return defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female'], // Only male and female can be selected
  },
  age: {
    type: Number,
    min: 0, // Age cannot be negative
    max: 100,
  },
  lastUsernameChange: {
    type: Date,
    default: null, // Initialize as null
  },
});

module.exports = mongoose.model("User", UserSchema);
