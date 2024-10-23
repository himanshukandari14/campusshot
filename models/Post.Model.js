const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  media: {
    type: String,
    required: true, // Ensure this field is required
    validate: {
      validator: function(v) {
        // Simple regex to validate image/video URLs
        return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|mp4|mov|avi|wmv|webm))$/i.test(v);
      },
      message: props => `${props.value} is not a valid image or video URL!`
    }
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  comments: [
    {
      text: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }
  ],
  shares: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
