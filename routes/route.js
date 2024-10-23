const express = require('express');
const { register, login, verifyOTP, verifyForgotPasswordOtp, forgetPassword, changePassword } = require('../controllers/authControllers/authController');
const { verifyToken } = require('../middleware/Auth');
const { createPost, fetchAllPosts, fetchPosts, fetchOnePost, deleteOnePost, likePost } = require('../controllers/postControllers/PostControllers');

const router = express.Router();

router.get('/', (req, res) => {
  res.send("Hello World");
});

router.post('/sign-up', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

// Forget password and verify forget password OTP
router.post('/forget-password', forgetPassword);
router.post('/verify-forget-password-OTP', verifyForgotPasswordOtp);

// Change password via currentPassword
router.post('/change-password', verifyToken, changePassword);

// Post controllers
router.post('/createPost',verifyToken, createPost);
router.get('/allposts',verifyToken, fetchAllPosts);
router.get('/user/all-posts',verifyToken,fetchPosts);
router.get('/user/post/:id',verifyToken,fetchOnePost);
router.delete('/user/post/delete/:id',verifyToken,deleteOnePost);
router.post('/user/post/like/:id',verifyToken,likePost);

module.exports = router;