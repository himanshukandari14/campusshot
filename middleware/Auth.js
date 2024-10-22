const jwt = require("jsonwebtoken");
const { findById } = require("../models/User.model");
const User = require("../models/User.model");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  // first check that req header has auth or not
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ error: "Token not found" });
  }
  const token = req.headers.authorization.split(" ")[1];
  console.log("Token is:", token);

  try {
    // verify jwtToken
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user info to req object
    req.user = decoded.userData;
    console.log("user data attached to req:", req.user);
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ succes: false, message: "Invalid token" });
  }
};

// func to generate token
const generateToken = (userData) => {
  return jwt.sign({ userData }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
};

module.exports = { verifyToken, generateToken };
