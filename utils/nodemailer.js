// Import the Nodemailer module
const nodemailer = require("nodemailer");
require("dotenv").config();
// Create a transporter object using SMTP transport
let transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.USER_MAIL, // Your email address
    pass: process.env.USER_PASS, // Your email password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Create a function to send an email
const sendEmail = (to, subject, text, otp) => {
  // Define email options
  let mailOptions = {
    from: "codesync", // Sender address
    to: to, // Recipient address
    subject: subject, // Email subject
    text: text, // Email body
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Brand</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing us. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />CampusShot</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>CampusShot</p>
      <p>Noida</p>
     
    </div>
  </div>
</div>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Export the sendEmail function for use in other modules
module.exports = sendEmail;
