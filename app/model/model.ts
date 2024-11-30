import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    UserId: {
        type: String,
        required: true
    },
    ThreadId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Challengepreferencess = new mongoose.Schema({
    UserId: {
        type: String,
        required: true
    },
    ChallengeId: {
        type: String,
        required: true
    },
    pushnotifications: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const userMetaSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            default: () => new mongoose.Types.ObjectId(), // Equivalent to Prisma's uuid()
            immutable: true, // Ensures id cannot be modified after creation
        },
        userId: {
            type: String,
            unique: true, // Ensures no duplicate userId
            required: true,
        },
        endpoint: {
            type: String,
            required: true,
        },
        p256dh: {
            type: String,
            required: true,
        },
        auth: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    }
);

// Middleware to update updatedAt timestamp before saving
const UserMeta = mongoose.models.UserMeta || mongoose.model("UserMeta", userMetaSchema);

const User = mongoose.models.Goggins_user || mongoose.model("Goggins_user", userSchema);
const Challengepreferences = mongoose.models.Challengepreferences || mongoose.model("Challengepreferences", Challengepreferencess);

export { User, Challengepreferences, UserMeta };