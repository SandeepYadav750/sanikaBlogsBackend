import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true, 
        unique: true,
    },
    password: {
        type: String,   
        required: true,
    },
    bio: {
        type: String,   
        default: "No bio available",
    },
    occupation: {    
        type: String,
        default: "Not specified",
    },
    photoURL: {
        type: String,
        default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },
    instgram: { type: String,  default: ""    },
    twitter: { type: String, default: ""  },
    linkedin: { type: String,  default: ""   },
    facebook: { type: String, default: ""    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
