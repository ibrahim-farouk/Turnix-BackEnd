import { Counter } from "../../models/index.js";

export const getNextSequence = async (name) => {
    const counter = await Counter.findOneAndUpdate(
        { name },
        { $inc: { sequence: 1 } },
        {
            new: true,
            upsert: true, // used to create the document if it doesn't exist
            runValidators: true
        }
    );
    return counter.sequence;
}