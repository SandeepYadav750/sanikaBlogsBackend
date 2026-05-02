import express from "express";
import dotenv from "dotenv";
import connectDB from "./Database/db.js";
import userRoute from "./routes/user.route.js";
import blogRoute from "./routes/blog.route.js";
import commentRoute from "./routes/comment.route.js";
import categoryRoute from "./routes/category.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://www.sanikablogs.com/",
      "https://sanika-blogs.vercel.app",
    ];

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // THIS IS CRITICAL - allows cookies
  methods: ["GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const app = express();
app.use(cors(corsOptions));
// derfault middleware
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRoute);
app.use("/api/blog", blogRoute);
app.use("/api/comment", commentRoute);
app.use("/api/category", categoryRoute);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`);
  });
});
