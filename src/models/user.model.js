import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple documents without an employeeId
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    mustChangePassword: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["ADMIN", "EMPLOYEE"],
        default: "EMPLOYEE",
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        default: null, // Set the default value to null
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        default: null, // Set the default value to null
    },
    counterNumber: {
        type: Number,
        default: null,
        min: 1
    },
    employeeNumber: {
        type: Number,
        unique: true,
        sparse: true // Allow multiple documents without an employeeNumber
    },
    profileImage: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    lastLogin: {
        type: Date,
        default: null
    },
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);