const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
 
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
      ref: "User",
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 24 hours = 86400 seconds
  },
});

module.exports = mongoose.model("Story", StorySchema);
