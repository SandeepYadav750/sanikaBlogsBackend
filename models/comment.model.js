import mongoose, { Mongoose } from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
    },
    likes: {
        type: Array,
        default: []
    },
    numberOfLikes: {
        type: Number,
        default: 0,
    },
    editedAt: {
        type: Date,
    },
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
