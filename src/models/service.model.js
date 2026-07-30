import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    prefix: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },
    lastTicketNumber: {
        type: Number,
        default: 100,
        min: 100,
    },
    lastTicketDate: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

serviceSchema.index({ branch: 1, name: 1 }, { unique: true }); // unique name per branch
serviceSchema.index({ branch: 1, prefix: 1 }, { unique: true }); // unique prefix per branch

export default mongoose.model("Service", serviceSchema);