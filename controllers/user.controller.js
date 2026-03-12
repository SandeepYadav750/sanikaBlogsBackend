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
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
      })
      .json({
        success: true,
        message: `${user.firstName} logged in successfully`,
        user,
      });
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
        maxAge: 0,
      })
      .json({ success: true, message: `User logged out successfully` });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Failed to log out user" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const {firstName, lastName, occupation, bio, instagram, twitter, facebook,linkedin } = req.body;
    const file = req.file;

    const fileUri = dataURI(file);

    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(fileUri).catch((error) => {
        console.log(error);
    });
    
    console.log(uploadResult);

    const user = await User.findByIdAndUpdate(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (occupation) user.occupation = occupation;
    if (bio) user.bio = bio;
    if (instagram) user.instagram = instagram;
    if (twitter) user.twitter = twitter;
    if (facebook) user.facebook = facebook;
    if (linkedin) user.linkedin = linkedin;
    if (file) user.photoURL = uploadResult.secure_url;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to update user profile", success: false });
  }
};
