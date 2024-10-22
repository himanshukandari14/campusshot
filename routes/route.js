const express=require('express');
const { register, login, verifyOTP } = require('../controllers/authControllers/authController');
const router=express.Router();

router.get('/', (req, res) => {
  res.send("Hello World");
});

router.post('/sign-up',register);
router.post('/verify-otp',verifyOTP)
router.post('/login',login);


module.exports= router;