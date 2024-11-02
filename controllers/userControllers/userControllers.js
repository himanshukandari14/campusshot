const UserModel = require("../../models/User.model");
const NotificationsModel = require("../../models/Notifications.model");

// Search for users
exports.searchUser = async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from the request

    // Ensure the query is provided
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    // Search for users by name or email (case insensitive)
    const users = await UserModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Assuming you have a 'name' field
        { email: { $regex: query, $options: 'i' } } // Assuming you have an 'email' field
      ]
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.followUser = async (req, res) => {
  try {
    // Get user
    const userData = req.user;
    const userId = userData.id;
    const userIdToFollow = req.params.id; // ID of the user to follow

    const loggedInUser = await UserModel.findById(userId);
    const userToFollow = await UserModel.findById(userIdToFollow);

    // Check if the user to follow exists
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User to follow does not exist',
      });
    }

    // Check if already following
    if (loggedInUser.following.includes(userIdToFollow)) {
      // Unfollow logic
      loggedInUser.following.pull(userIdToFollow); // Remove from following
      userToFollow.followers.pull(userId); // Remove from followers

      await loggedInUser.save(); // Save the updated logged-in user
      await userToFollow.save(); // Save the updated user being unfollowed

      return res.status(200).json({
        success: true,
        message: 'User unfollowed successfully',
      });
    }

    // Follow logic
    loggedInUser.following.push(userIdToFollow); // Add to following
    userToFollow.followers.push(userId); // Add to followers

    await loggedInUser.save(); // Save the updated logged-in user
    await userToFollow.save(); // Save the updated user being followed

    // Create a new notification for the user being followed
    const notificationMessage = `${loggedInUser.name} has followed you.`; // Use loggedInUser's name
    const notification = new NotificationsModel({
      userId: loggedInUser._id,         // The user who followed
      recipientId: userIdToFollow,      // The user being followed
      message: notificationMessage
    });

    await notification.save(); // Save the notification

    // Push the notification ID into the followed user's notifications array
    userToFollow.notifications.push(notification._id); // Push the notification ID
    await userToFollow.save(); // Save the updated user

    return res.status(200).json({
      success: true,
      message: 'User followed successfully',
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Fetch all followers of the logged-in user
exports.fetchFollowers = async (req, res) => {
  try {
    const userData = req.user; // Get user data from the request
    const userId = userData.id; // Get the logged-in user's ID

    const loggedInUser = await UserModel.findById(userId).populate('followers', 'name username profile'); // Populate followers with name, username, and profile

    return res.status(200).json({
      success: true,
      followers: loggedInUser.followers, // Return the followers
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Fetch all users that the logged-in user is following
exports.fetchFollowing = async (req, res) => {
  try {
    const userData = req.user; // Get user data from the request
    const userId = userData.id; // Get the logged-in user's ID

    const loggedInUser = await UserModel.findById(userId).populate('following', 'name username profile'); // Populate following with name, username, and profile

    return res.status(200).json({
      success: true,
      following: loggedInUser.following, // Return the following users
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update user profile with new fields
exports.updateUserProfile = async (req, res) => {
  try {
    const userData = req.user; // Get user data from the request
    const userId = userData.id; // Get the logged-in user's ID

    // Get the new fields from the request body
    const { name, username, pronouns, department, year, gender, age } = req.body;

    // Validate the input
    if (!name && !username && !pronouns && !department && !year && !gender && age === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update',
      });
    }

    // Check if gender is valid
    if (gender && !['male', 'female'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be either "male" or "female".',
      });
    }

    const loggedInUser = await UserModel.findById(userId);

    // Check if the username is being updated
    if (username) {
      // Check if the username is already taken
      const existingUser = await UserModel.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken',
        });
      }

      // Check if 14 days have passed since the last username change
      const now = new Date();
      const lastChangeDate = loggedInUser.lastUsernameChange;
      const daysSinceLastChange = lastChangeDate ? (now - lastChangeDate) / (1000 * 60 * 60 * 24) : null;

      if (daysSinceLastChange !== null && daysSinceLastChange < 14) {
        return res.status(400).json({
          success: false,
          message: 'You can only change your username once every 14 days.',
        });
      }
    }

    // Prepare the update object
    const updateData = {};
    if (name) updateData.name = name; // Only add name if it's provided
    if (username) {
      updateData.username = username; // Only add username if it's provided
      updateData.lastUsernameChange = new Date(); // Update the last username change timestamp
    }
    if (pronouns) updateData.pronouns = pronouns; // Only add pronouns if it's provided
    if (department) updateData.department = department; // Only add department if it's provided
    if (year) updateData.year = year; // Only add year if it's provided
    if (gender) updateData.gender = gender; // Only add gender if it's provided
    if (age !== undefined) updateData.age = age; // Only add age if it's provided

    // Update the user's profile
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true } // Return the updated user
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Fetch logged-in user data
exports.fetchLoggedInUserData = async (req, res) => {
  try {
    const userData = req.user; // Get user data from the request
    const userId = userData.id; // Get the logged-in user's ID

    // Find the user by ID and populate necessary fields if required
    const loggedInUser = await UserModel.findById(userId);

    // Check if the user exists
    if (!loggedInUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: loggedInUser, // Return the logged-in user's data
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};