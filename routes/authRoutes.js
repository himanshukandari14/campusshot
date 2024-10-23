const express = require('express');
const { verifyToken } = require('../middleware/Auth'); // Ensure this is the correct path
const { changePassword } = require('../controllers/authControllers/authController');

const router = express.Router();

router.put('/change-password', verifyToken, changePassword); // Protect the route with verifyToken

module.exports = router;
