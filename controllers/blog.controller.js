import Blog from "../models/blog.model.js";
import cloudinary from "../utils/cloudinary.js";
import dataURI from "../utils/dataURI.js";

// ✅ Helper function to generate unique slug
async function generateUniqueSlug(title) {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);

  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists
  let existingBlog = await Blog.findOne({ slug });
  while (existingBlog) {
    slug = `${baseSlug}-${counter}`;
    existingBlog = await Blog.findOne({ slug });
    counter++;
  }

  return slug;
}

export const createBlog = async (req, res) => {
  try {
    const { title, description, category, isPublished } = req.body;
    const author = req.id;

    // Validate required fields
    if (!title || title.trim() === "") {
      return res
        .status(400)
        .json({ message: "Title is required", success: false });
    }

    if (!author) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    let thumbImage;
    // Check if file exists (assuming you're using multer)
    if (req.file) {
      const fileUri = dataURI(req.file);
      thumbImage = await cloudinary.uploader.upload(fileUri);
    }

    // ✅ Generate unique slug
    const slug = await generateUniqueSlug(title);

    const blog = await Blog.create({
      title,
      slug, // ← Generated slug
      description,
      thumbnail: thumbImage?.secure_url,
      author: author,
      category,
      isPublished,
    });

    return res.status(201).json({
      message: "Blog created successfully",
      blog,
      success: true,
    });
  } catch (error) {
    console.error("Error creating blog:", error); // Log the actual error
    return res.status(500).json({
      message: "Failed to create blog",
      error: error.message, // Send the error message instead of the whole object
      success: false,
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const file = req.file;

    const { title, description, category } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }

    let thumbImage;
    if (file) {
      const fileUri = dataURI(file);
      thumbImage = await cloudinary.uploader.upload(fileUri);
    }

    // ✅ Generate new slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = await generateUniqueSlug(title, blogId);
    }

    const updateData = {
      title,
      slug,
      description,
      category,
      thumbnail: thumbImage?.secure_url,
      author: req.id,
    };

    const blogData = await Blog.findByIdAndUpdate(blogId, updateData, {
      new: true, // ✅ Use 'new' instead of 'returnDocument' (mongoose standard)
    });

    res.status(200).json({
      blog: blogData,
      success: true,
      message: "Blog updated successfully",
    });
  } catch (error) {
    console.error("Error updating blog:", error); // Log the actual error
    return res.status(500).json({
      message: "Failed to update blog",
      error: error.message, // Send the error message instead of the whole object
      success: false,
    });
  }
};

export const listBlog = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(400).json({ message: "user Id required" });
    }

    const blogs = await Blog.find({ author: userId }).populate({
      path: "author",
      select: "firstName lastName photoURL occupation",
    });

    if (!blogs) {
      return res
        .status(404)
        .json({ message: "no blogs found", blogs: [], success: false });
    }

    return res.status(200).json({ blogs, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error while fetching", error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }

    if (!blog.author || blog.author.toString() !== userId) {
      return res.status(403).json({
        message: "user not authorized to delete this blog",
        success: false,
      });
    }

    await Blog.findByIdAndDelete(blogId);

    res
      .status(200)
      .json({ message: "Blog deleted successfully", success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message,
    });
  }
};

export const getPublishedBlog = async (_, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "firstName lastName photoURL occupation",
      });

    if (!blogs) {
      res.status(401).json({ message: "Blogs not found" });
    }
    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "failed to get isPublished blogs" });
  }
};

export const togglePublishedBlog = async (req, res) => {
  try {
    const { id } = req.params;
    // const { publish } = req.query;

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    const statusMessage = blog.isPublished ? "Published" : "UnPublished";
    return res
      .status(200)
      .json({ success: true, message: `Blog is ${statusMessage}`, blog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "failed to get isPublished blogs" });
  }
};

export const likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const likekrneWaleKiId = req.id; // This might be undefined or empty string

    if (!likekrneWaleKiId) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const blog = await Blog.findById(blogId).populate({ path: "likes" });
    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }

    // like logic
    await blog.updateOne({ $addToSet: { likes: likekrneWaleKiId } });
    await blog.save();

    return res
      .status(200)
      .json({ success: true, message: `Blog Liked successfully`, blog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "failed to like blogs" });
  }
};

export const disLikeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const likekrneWaleKiId = req.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }
    // dislike logic
    await blog.updateOne({ $pull: { likes: likekrneWaleKiId } });
    await blog.save();

    return res
      .status(200)
      .json({ success: true, message: `Blog Disliked successfully`, blog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "failed to dislike blogs" });
  }
};

export const getMyTotalBlocks = async (req, res) => {
  try {
    const userId = req.id;
    const myBlogs = await Blog.find({ author: userId }).select("likes");
    const totalLikes = myBlogs.reduce(
      (acc, blog) => acc + (blog.likes?.length || 0),
      0,
    );

    return res
      .status(200)
      .json({ success: true, totalBlogs: myBlogs.length, totalLikes });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "failed to fetch total blogs likes" });
  }
};
