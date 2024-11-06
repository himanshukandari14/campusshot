const express = require('express');
const { register, login, verifyOTP, verifyForgotPasswordOtp, forgetPassword, changePassword } = require('../controllers/authControllers/authController');
const { verifyToken } = require('../middleware/Auth');
const { createPost, fetchAllPosts, fetchPosts, fetchOnePost, deleteOnePost, likePost, createComment, fetchAllComments } = require('../controllers/postControllers/PostControllers');
const { createStory, deleteStory, fetchAllStories, fetchOneStory } = require('../controllers/storyControllers/storyControllers');
const { searchUser, followUser, fetchFollowers, fetchFollowing, updateUserProfile, fetchLoggedInUserData, fetchSpecificUser } = require('../controllers/userControllers/userControllers');


const router = express.Router();

router.get('/', (req, res) => {
  res.send("Hello World");
});

// auth controllers
router.post('/sign-up', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forget-password', forgetPassword);// Forget password and verify forget password OTP
router.post('/verify-forget-password-OTP', verifyForgotPasswordOtp);
router.post('/change-password', verifyToken, changePassword); // Change password via currentPassword

// user controllers
router.get('/search-users', verifyToken, searchUser); // Define the route for searching users
router.post('/user/follow/:id', verifyToken, followUser); // Follow/Unfollow user
router.get('/user/followers', verifyToken, fetchFollowers); // Fetch followers
router.get('/user/following', verifyToken, fetchFollowing); // Fetch following
router.put('/user/update-profile', verifyToken, updateUserProfile); // Update user profile
router.get('/fetchLoggedInUser',verifyToken,fetchLoggedInUserData);
router.get('/users/:id',verifyToken,fetchSpecificUser);

// Post controllers
router.post('/createPost',verifyToken, createPost);
router.get('/allposts',verifyToken, fetchAllPosts);
router.get('/user/all-posts',verifyToken,fetchPosts);
router.get('/user/post/:id',verifyToken,fetchOnePost);
router.delete('/user/post/delete/:id',verifyToken,deleteOnePost);
router.post('/user/post/like/:id',verifyToken,likePost);
router.post('/user/post/comment/:id',verifyToken,createComment);
router.get('/posts/:id/comments',verifyToken,fetchAllComments);

// story controllers
router.post('/user/story-upload',verifyToken,createStory);
router.get('/all-stories', verifyToken, fetchAllStories);
router.get('/user/story/:id', verifyToken, fetchOneStory);
router.delete('/user/story/delete/:id', verifyToken, deleteStory);


module.exports = router;
