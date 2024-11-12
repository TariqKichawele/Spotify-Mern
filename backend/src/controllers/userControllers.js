import { User } from "../models/userModel.js"
import { Message } from "../models/messageModel.js"

export const getAllUsers = async (req, res, next) => {
    try {
        const currentUserId = req.auth.userId;
        const users = await User.find({ clerkId: { $ne: currentUserId } });
        console.log(users)
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const myId = req.auth.userId;
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userId },
                { senderId: userId, receiverId: myId }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
}