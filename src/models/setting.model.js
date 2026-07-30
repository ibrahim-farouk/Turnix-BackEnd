import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
    defaultServiceTime: {
        type: Number,
        required: true,
        default: 15,
        min: 1
    },
},{
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Setting", settingSchema);