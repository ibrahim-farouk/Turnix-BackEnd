import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        ticketNumber: {
            type: String,
            required: true,
            trim: true
        },

        customerName: {
            type: String,
            required: true,
            trim: true
        },

        customerPhone: {
            type: String,
            required: true,
            trim: true
        },

        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },

        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },

        status: {
            type: String,
            required: true,
            enum: [
                "WAITING",
                "SERVING",
                "COMPLETED",
                "SKIPPED",
                "CANCELLED"
            ],
            default: "WAITING"
        },

        counterNumber: {
            type: Number,
            default: null
        },

        calledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        guestTokenHash: {
            type: String,
            required: true,
            select: false
        },

        joinedAt: {
            type: Date,
            default: Date.now
        },

        queueDate: {
            type: String,
            required: true,
            index: true
        },

        calledAt: {
            type: Date,
            default: null
        },

        completedAt: {
            type: Date,
            default: null
        },

        skippedAt: {
            type: Date,
            default: null
        },

        cancelledAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Unique ticket number inside each branch/service queue
ticketSchema.index(
    {
        branch: 1,
        service: 1,
        queueDate: 1,
        ticketNumber: 1
    },
    {
        unique: true
    }
);

// Optimize queue queries
ticketSchema.index({
    branch: 1,
    service: 1,
    queueDate: 1,
    status: 1,
    joinedAt: 1
});

ticketSchema.index(
    {
        branch: 1,
        service: 1,
        queueDate: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            status: "SERVING"
        }
    }
);

export default mongoose.model("Ticket", ticketSchema);