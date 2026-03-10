import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const connectDB = async () => {
  try {
    const URI = process.env.MONGODB_URI;
    await mongoose.connect(URI);
    console.log("database connected successfully");
  } catch (error) {
    console.log(`database connection error: Failed`, error);
    process.exit(0);
  }
};

export default connectDB;
