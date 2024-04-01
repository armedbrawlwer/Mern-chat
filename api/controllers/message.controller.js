import Message from "../models/message.model.js";
import { verifyToken } from "../utils/verifyToken.js";
import jwt from 'jsonwebtoken'
import { getUserData } from "../utils/getUserData.js";

export const fetchMessages = async (req, res, next) => {
    const { userId } = req.params;
    const userData = await getUserData(req)
    const ourUserId = userData.id;
    console.log({ userId, ourUserId })

    const messages = await Message.find({
        sender: { $in: [userId, ourUserId] },
        recipient: { $in: [userId, ourUserId] }
    }).sort({ createdAt: 1 }).exec();

    res.json(messages)
}