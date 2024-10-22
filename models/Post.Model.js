const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  caption: {
    type: String,
    maxLength: [200, "Cannot store more than 200 characters"],
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function (value) {
        // Either imageUrl or videoUrl should be provided, but not both.
        return !this.videoUrl || !value; // Return true if there's no video or image
      },
      message: "Post can contain either an image or a video, not both",
    },
  },
  videoUrl: {
    type: String,
    validate: {
      validator: function (value) {
        // Either videoUrl or imageUrl should be provided, but not both.
        return !this.imageUrl || !value; // Return true if there's no image or video
      },
      message: "Post can contain either a video or an image, not both",
    },
  },
  likes:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    }
  ],
  comments: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
  ],
  shares:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
  ],
  Author:{
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
