import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";

export const createComment = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;
    const { content } = req.body;

    const blog = await Blog.findById(postId);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }
    if (!content) {
      return res.status(400).json({
        message: "Content are required",
        success: false,
      });
    }
    const comment = new Comment({
      content,
      userId,
      postId,
    });
    await comment.save();
    await comment.populate({
      path: "userId",
      select: "firstName lastName photoURL",
    });

    blog.comments.push(comment._id);
    await blog.save();
    return res.status(201).json({
      message: "Comment created successfully!",
      success: true,
      comment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while creating comment",
      error: error.message,
    });
  }
};

export const getCommentsByPostId = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ postId })
      .populate({
        path: "userId",
        select: "firstName lastName photoURL",
      })
      .sort({ createdAt: -1 });

    if (!comments) {
      return res.status(404).json({
        message: "No comments found for this post",
        success: false,
        comments: [],
      });
    }
    return res.status(200).json({
      message: "Comments fetched successfully",
      success: true,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while fetching comments",
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.id;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        success: false,
      });
    }
    if (!comment.userId || comment.userId.toString() !== userId) {
      return res.status(403).json({
        message: "User not authorized to delete this comment",
        success: false,
      });
    }

    const blogId = comment.postId;
    await Comment.findByIdAndDelete(commentId);
    await Blog.findByIdAndUpdate(blogId, { $pull: { comments: commentId } });

    return res.status(200).json({
      message: "Comment deleted successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while deleting comment",
      error: error.message,
    });
  }
};

export const editComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.id;
    const { content } = req.body;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        success: false,
      });
    }
    if (!comment.userId || comment.userId.toString() !== userId) {
      return res.status(403).json({
        message: "User not authorized to edit this comment",
        success: false,
      });
    }
    if (!content) {
      return res.status(400).json({
        message: "Content is required",
        success: false,
      });
    }
    comment.content = content;
    comment.editedAt = Date.now();

    await comment.save();

    return res.status(200).json({
      message: "Comment updated successfully",
      success: true,
      comment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while updating comment",
      error: error.message,
    });
  }
};

export const likeComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.id;
    const comment = await Comment.findById(commentId).populate("userId");

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        success: false,
      });
    }
    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId);
      comment.numberOfLikes = comment.likes.length;
      await comment.save();
      return res.status(200).json({
        message: "Comment unliked successfully",
        success: true,
        comment,
      });
    } else {
      comment.likes.push(userId);
      comment.numberOfLikes = comment.likes.length;
      await comment.save();
      return res.status(200).json({
        message: "Comment liked successfully",
        success: true,
        comment,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error while liking/unliking comment",
      error: error.message,
    });
  }
};

export const getAllCommentOnMyBlogs = async (req, res) => {
  try {
    const userId = req.id;

    //FIND ALL BLOGS POST CERATED BY THE LOGGED IN USER
    const myBlogs = await Blog.find({ author: userId }).select("_id");
    const myBlogIds = myBlogs.map((blog) => blog._id);

    if (myBlogIds.length === 0) {
      return res.status(200).json({
        message: "No blogs found for this user",
        success: false,
        comments: [],
        totalComments: 0,
      });
    }

    const comments = await Comment.find({ postId: { $in: myBlogIds } })
      .populate("userId", "firstName lastName email")
      .populate("postId", "title");

    // if (!comments || comments.length === 0) {
    //     return res.status(404).json({
    //         message: "No comments found for this user",
    //         success: false,
    //     });
    // }

    return res.status(200).json({
      message: "Comments for user retrieved successfully",
      success: true,
      totalComments: comments.length,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while retrieving likes for comment",
      error: error.message,
    });
  }
};
