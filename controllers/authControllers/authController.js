const { generateToken } = require('../../middleware/Auth');
const  sendEmail = require('../../utils/nodemailer'); // Ensure to import sendEmail

const userModel = require("../../models/User.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000); // Generates a random OTP
const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

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
      otpExpires
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


//  verify OTP
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
