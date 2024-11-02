const PostModel = require('../../models/Post.Model');
const UserModel = require('../../models/User.model');
const cloudinary=require('cloudinary').v2;  
const {cloudinaryConnect} = require('../../config/cloudinaryConfig'); // Import Cloudinary config
const NotificationsModel = require('../../models/Notifications.model');

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
      author: loggedinUser._id,
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

// fetch all posts
exports.fetchAllPosts=async(req,res)=>{
  try {
    const allPosts= await PostModel.find().populate('author');

    return res.status(200).json({
      success:true,
      allPosts
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
// fetch all post of  logged in user post
exports.fetchPosts=async(req,res)=>{

    try {
         // Get user
    const userData = req.user;
    const userId = userData.id;

    const loggedInUser=await UserModel.findById(userId);
    console.log('id of logged in user',userId);
    

   

    // Fetch posts content for the logged-in user and populate all author details
    const loggedInUserPosts = await PostModel.find({ author: loggedInUser._id }).populate('author'); // Populate all fields of the author
     return res.status(200).json({
        success:true,
        loggedInUserPosts
    })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

exports.fetchOnePost=async(req,res)=>{
    try {
         const postId=req.params.id;
         
         const post= await PostModel.findById(postId).populate('author');

         if(!post){
             return res.status(404).json({
                success:false, 
                message:"No such post found"
            })
         }
         console.log(post);

         return res.status(200).json({
            success:true,
            post
         })
    } catch (error) {
         console.log(error);
        return res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

exports.deleteOnePost=async(req,res)=>{
    try {
    // Get user and delete his post
    const postId=req.params.id;
    const userData = req.user;
    const userId = userData.id;

    const loggedInUser=await UserModel.findById(userId);
    console.log('id of logged in user',userId);

    // if logged in user post does not have id of proposing delete post, that means this post not to logged in user
    if(!(loggedInUser.posts.includes(postId))){
        return res.status(400).json({
            success:false,
            message:'This post does not belong to you',
            loggedInUser
        })

    }
    // if it belongs
    const deletedPost= await PostModel.findByIdAndDelete(postId);
    loggedInUser.posts.pull(postId); // Use pull to remove the postId from the array
    await loggedInUser.save();

      return res.status(200).json({
            success:true,
            message:'Post deleted successfully',
            deletedPost
        })
    } catch (error) {
      console.log(error);
          return res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userData = req.user;
    const userId = userData.id;

    const loggedInUser = await UserModel.findById(userId);
    const likedPost = await PostModel.findById(postId);

    // Check if the post exists
    if (!likedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if the user has already liked the post
    if (likedPost.likes.includes(loggedInUser._id)) {
      likedPost.likes.pull(loggedInUser._id);
      await likedPost.save(); // Save the updated post

      return res.status(200).json({
        success: true,
        message: "Post unliked successfully"
      });
    }

    // Add the user ID to the likes array
    likedPost.likes.push(loggedInUser._id);
    await likedPost.save(); // Save the updated post

    // post owner's ID
    const postOwnerId = likedPost.author; // Get the author's ID directly

    // Create a new notification for the post owner
    const notificationMessage = `User ${loggedInUser.name} liked your post.`; // Use loggedInUser's name
    const notification = await new NotificationsModel({
      userId: loggedInUser._id,         // The user who liked the post
      postId: postId,                   // The post that was liked
      recipientId: postOwnerId,         // The owner of the post
      message: notificationMessage
    });

   
  await notification.save();
    console.log(notification)
    // Push the notification ID into the post owner's notifications array
    const postOwner = await UserModel.findById(postOwnerId);
    postOwner.notifications.push(notification._id); // Push the notification ID
    await postOwner.save(); // Save the updated user

    return res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      likedPost,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// create comment
exports.createComment = async (req, res) => {
  try {
    // Get user and delete his post
    const postId = req.params.id;
    const userData = req.user;
    const userId = userData.id;

    const loggedInUser = await UserModel.findById(userId);

    // fetch data
    const { text } = req.body;

    // current post
    const currentPost = await PostModel.findById(postId);
    
    // Check if the post exists
    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Add the comment to the post
    currentPost.comments.push({ text: text, author: loggedInUser._id }); // Assuming comments are objects with text and author
    await currentPost.save(); // Save the updated post

     // post owner's ID
    const postOwnerId = currentPost.author; // Get the author's ID directly

    // create new notifi for user
    const notificationMessage=`${loggedInUser} has commented on your post`
    const notification = await new NotificationsModel({
      userId:loggedInUser._id,
      postId:currentPost._id,
      message:notificationMessage,
      recipientId:postOwnerId
    })

    await notification.save();
     console.log(notification)
    // Push the notification ID into the post owner's notifications array
    const postOwner = await UserModel.findById(postOwnerId);
    postOwner.notifications.push(notification._id); // Push the notification ID
    await postOwner.save(); // Save the updated user

    return res.status(200).json({
      success: true,
      message: 'Comment added successfully and notification created',
      currentPost,
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Fetch all comments on a specific post
exports.fetchAllComments = async (req, res) => {
  try {
    const postId = req.params.id;

    // Find the post and populate the comments
    const post = await PostModel.findById(postId).populate({
      path: 'comments.author',
      select: 'name', // Adjust the fields to retrieve as necessary
    });

    // Check if the post exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Return the comments for the post
    return res.status(200).json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
