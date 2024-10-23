
const PostModel = require('../../models/Post.Model');
const UserModel = require('../../models/User.model');
const cloudinary=require('cloudinary').v2;  
const {cloudinaryConnect} = require('../../config/cloudinaryConfig'); // Import Cloudinary config

cloudinaryConnect();

function isFileTypeSupported(type, supportedType){
    return supportedType.includes(type);
}

async function uploadFileToCloudinary(file, folder) {
    const options = {
        folder,
        resource_type: file.mimetype.startsWith('video/') ? 'video' : 'auto', // Set resource type
    };
    return await cloudinary.uploader.upload(file.tempFilePath, options);
}


// Create a post
exports.createPost = async (req, res) => {
  try {
    // Get user
    const userData = req.user;
    const userId = userData.id;

    const loggedinUser = await UserModel.findById(userId);

    // Fetch data from body
    const { title } = req.body; // Expecting media to be a URL

        console.log('Uploaded files:', req.files);

      const file = req.files.media;
        console.log("file=>",file);

        // supported file
        const supportedTypes=["jpeg","jpg","png","mp4","mov","gif"];
         const fileType = file.name.split('.').pop().toLowerCase(); // Get file extension

        console.log('before support')

        // check support
        if(!isFileTypeSupported(fileType,supportedTypes)){
          return res.status(400).json(({
            success:false,
            message:'file type not supported',
          }))
        }
        console.log('after support')

        // if file format supported
        const response = await uploadFileToCloudinary(file,"CAMPUSSHOT");
         console.log('after res')

        console.log("response=>",response);

    const newPost = await new PostModel({
      title,
      media: response.secure_url, // Save the Cloudinary URL
      user: loggedinUser._id,
    });

    await newPost.save();
    loggedinUser.posts.push(newPost._id);
    await loggedinUser.save();

    return res.status(200).json({
      success: true,
      message: "Post created successfully",
      newPost,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
