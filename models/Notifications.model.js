const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { // The user who performed the action
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: { // The post that was interacted
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
       
    },
    recipientId: { // The user who will receive the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: { // The notification message
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
