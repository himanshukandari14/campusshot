const { generateToken } = require('../../middleware/Auth');
const  sendEmail = require('../../utils/nodemailer'); // Ensure to import sendEmail

const userModel = require("../../models/User.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000); // Generates a random OTP
const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes



var forgetPasswordOtp=null;
var forgetPasswordExpires=null; // 15 minutes from now

exports.register = async (req, res) => {
  try {
    // fetch data
    const { name, username, email, password } = req.body;

    if (!(name || username || email || password)) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // check if user already exists?
    const user = await userModel.findOne({ email });

    // if user already exists
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    //if user does not exists hash the password and store in db
    const hashedPassword = bcrypt.hashSync(password, 10);

    const otp = generateOTP(); // Generate OTP

    const newUser = new userModel({
      name,
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      forgetPasswordOtp,
      forgetPasswordExpires
    });
    // save user to db
    await newUser.save();

    const subject = "Registration Successful on CodeSync";
    const text = `Hello ${name},\n\nThank you for registering on our website. Your OTP is: ${otp}`;

    // Send the OTP in the email
    sendEmail(email, subject, text, otp);
    // Store OTP in the database or in-memory store for verification later
    console.log("New user created =>", user);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if(!(username || password)){
        return res.status(400).json({ message: "Please enter both username and password" });
    }

    // check for existence of user
    const user = await userModel.findOne({ username });

    // if user does not exists
    if (!user) {
      return res.status(400).json({
        message: "user does not exists with this username",
      });
    }
    // if user exists check password
    const isValidPassword = bcrypt.compareSync(password, user.password);

    // if passowrd wrong
    if (!isValidPassword) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // make payload
    const payload = {
      id: user.id,
      username: user.username,
      email:user.email,
    };
    console.log("payload is =>", payload);

    const token = generateToken(payload);

    // retrun res

    return res.json({
      token,
      user,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
};


//  verify OTP for registration
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    console.log(
      "this is stored user otp:",
      user.otp,
      "and this is otp it is compared with:",
      otp
    );
    console.log("OTP Expires At:", user.otpExpires);
    console.log("Current Time:", Date.now());

    // Check if OTP matches and is not expired
    if (user.otp === otp && user.otpExpires > Date.now()) {
      // OTP is valid, activate the user account
      user.isActive = true; // Assuming you have an isActive field
      user.otp = undefined; // Clear OTP
      user.otpExpires = undefined; // Clear expiration
      await user.save();

      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// forget password

exports.forgetPassword = async (req, res) => {
  try {
    // fetch data
    const { email } = req.body;

    // find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // generate otp
    const forgetPasswordOtp = generateOTP(); // Generate OTP
    const forgetPasswordExpires = Date.now() + 900000; // 15 minutes from now

    // Assign OTP and expiration to user
    user.forgetPasswordOtp = forgetPasswordOtp;
    user.forgetPasswordExpires = forgetPasswordExpires;

    // Save the updated user object
    await user.save();

    // send otp to mail
    const subject = "Reset Password for your CampusShot account";
    const text = `This is your OTP for resetting the password: ${forgetPasswordOtp}. Please don't share it with anybody.`;

    // Send the OTP in the email
    sendEmail(email, subject, text, forgetPasswordOtp);

    return res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// verify forgot password otp
exports.verifyForgotPasswordOtp = async (req, res) => {
  try {
    // fetch otp and new password and email
    const { email, otp, newPassword } = req.body;

    // check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // check if otp is valid
    if (user.forgetPasswordOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // check if otp has expired
    if (user.forgetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const hashedNewPassword=bcrypt.hashSync(newPassword,10);
    // update password
    user.password = hashedNewPassword; // Update the password
    user.forgetPasswordOtp = undefined; // Clear OTP
    user.forgetPasswordExpires = undefined; // Clear expiration
    await user.save(); // Save the updated user

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// chnage password via currentPassword
exports.changePassword = async (req, res) => {
  try {
    // Check if req.user is defined
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedNewPassword; // Update the password
    await user.save(); // Save the updated user

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
