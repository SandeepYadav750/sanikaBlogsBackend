import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dataURI from "../utils/dataURI.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // user input validation
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    // password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }
    // email format validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }
    // email uniqueness validation
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to register user" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // token expires in 7 days
    });

    // FIXED: Cookie options for cross-domain production
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Required for HTTPS
      sameSite: "none", // Required for cross-site requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
      // REMOVE domain: ".onrender.com" - Let it be automatic
    };

    // Log to debug
    console.log("Setting cookie with options:", cookieOptions);
    console.log("Frontend origin:", req.headers.origin);

    return res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        message: `${user.firstName} logged in successfully`,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          photoURL: user.photoURL,
          bio: user.bio,
          occupation: user.occupation,
          instagram: user.instagram,
          twitter: user.twitter,
          linkedin: user.linkedin,
          facebook: user.facebook,
        },
        token, // Send token in response as well for backup
      });

    // return res
    //   .status(200)
    //   .cookie("token", token, {
    //     httpOnly: true, // Prevents XSS attacks
    //     secure: true, // Required for HTTPS (Render uses HTTPS)
    //     sameSite: "none", // CRITICAL: Allows cross-origin requests
    //     // maxAge: 60 * 1000, // 1 minute
    //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    //     path: "/",
    //     domain: ".onrender.com", // For Render backend
    //   })
    //   .json({
    //     success: true,
    //     message: `${user.firstName} logged in successfully`,
    //     user,
    //     token,
    //   });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Failed to log in user" });
  }
};

export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 0,
        path: "/",
      })
      .json({
        success: true,
        message: `User logged out successfully`,
        token: null,
      });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Failed to log out user" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const {
      firstName,
      lastName,
      occupation,
      bio,
      instagram,
      twitter,
      facebook,
      linkedin,
    } = req.body;

    const file = req.file;

    let photoURL;

    if (file) {
      const fileUri = dataURI(file);

      const uploadResult = await cloudinary.uploader.upload(fileUri);

      photoURL = uploadResult.secure_url;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (occupation) user.occupation = occupation;
    if (bio) user.bio = bio;
    if (instagram) user.instagram = instagram;
    if (twitter) user.twitter = twitter;
    if (facebook) user.facebook = facebook;
    if (linkedin) user.linkedin = linkedin;
    if (photoURL) user.photoURL = photoURL;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);

    return res.status(500).json({
      message: "Failed to update user profile",
      success: false,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password field

    res.status(200).json({
      success: true,
      message: "User list fetched successfully",
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching user list:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Add this route to verify authentication

export const getVerify = async (req, res) => {
  try {
    const user = await User.findById(req.id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};
