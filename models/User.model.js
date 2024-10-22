const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: string,
    required: true,
    minLength: 1,
    maxlength: [30, "Username cannot exceed 20 characters"],
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    required: true,
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

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model = ("User", UserSchema);
