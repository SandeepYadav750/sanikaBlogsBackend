import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    description: {
        type: String,
        trim: true,
    },
    thumbnail: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        trim: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
    isPublished: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Virtual for URL
blogSchema.virtual('url').get(function() {
    return `/blog/${this.slug}`;
});

blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;