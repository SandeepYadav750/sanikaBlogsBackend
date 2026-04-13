import express from "express";
import dotenv from "dotenv";
import connectDB from "./Database/db.js";
import userRoute from "./routes/user.route.js";
import blogRoute from "./routes/blog.route.js";
import commentRoute from "./routes/comment.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();

const corsOptions = {
  origin: ["http://localhost:3000", "http://169.254.83.107:3000", 'https://sanika-blogs.vercel.app'],
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
// derfault middleware
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRoute);
app.use("/api/blog", blogRoute);
app.use("/api/comment", commentRoute);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`);
  });
});
