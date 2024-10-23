const cloudinary = require('cloudinary').v2;  
const { cloudinaryConnect } = require('../../config/cloudinaryConfig'); // Import Cloudinary config
const StoryModel = require('../../models/Story.model');
const UserModel = require('../../models/User.model');

cloudinaryConnect();

function isFileTypeSupported(type, supportedType) {
    return supportedType.includes(type);
}

async function uploadFileToCloudinary(file, folder) {
    const options = {
        folder,
        resource_type: file.mimetype.startsWith('video/') ? 'video' : 'auto', // Set resource type
    };
    return await cloudinary.uploader.upload(file.tempFilePath, options);
}

// Create a story
exports.createStory = async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const loggedinUser = await UserModel.findById(userId);

        console.log('Uploaded files:', req.files);
        const file = req.files.media;
        console.log("file=>", file);

        const supportedTypes = ["jpeg", "jpg", "png", "mp4", "mov", "gif"];
        const fileType = file.name.split('.').pop().toLowerCase(); // Get file extension

        if (!isFileTypeSupported(fileType, supportedTypes)) {
            return res.status(400).json({
                success: false,
                message: 'file type not supported',
            });
        }

        const response = await uploadFileToCloudinary(file, "CAMPUSSHOT");
        console.log("response=>", response);

        const newStory = await new StoryModel({
            media: response.secure_url, // Save the Cloudinary URL
            author: loggedinUser._id,
        });

        await newStory.save();
        loggedinUser.stories.push(newStory._id);
        await loggedinUser.save();

        return res.status(200).json({
            success: true,
            message: "Story created successfully",
            newStory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Fetch all stories
exports.fetchAllStories = async (req, res) => {
    try {
        const stories = await StoryModel.find().populate('author', 'name');
        return res.status(200).json({
            success: true,
            stories,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Fetch a single story
exports.fetchOneStory = async (req, res) => {
    try {
        const storyId = req.params.id;
        const story = await StoryModel.findById(storyId).populate('author', 'name');
        if (!story) {
            return res.status(404).json({
                success: false,
                message: "Story not found",
            });
        }
        return res.status(200).json({
            success: true,
            story,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Delete a story
exports.deleteStory = async (req, res) => {
    try {
        const storyId = req.params.id;
    const userData = req.user;
    const userId = userData.id;

    
    const loggedInUser=await UserModel.findById(userId);

     // if logged in user post does not have id of proposing delete post, that means this post not to logged in user
    if(!(loggedInUser.stories.includes(storyId))){
        return res.status(400).json({
            success:false,
            message:'This story does not belong to you',
            loggedInUser
        })

    }
        const story = await StoryModel.findByIdAndDelete(storyId);
        loggedInUser.stories.pull(storyId);
        await loggedInUser.save();

        if (!story) {
            return res.status(404).json({
                success: false,
                message: "Story not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Story deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};