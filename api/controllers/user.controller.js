import User from "../models/user.model.js";

export const fetchUsers = async (req, res, next) => {

    const users = await User.find({}, { '_id': 1, username: 1 });
    res.json(users)
    next()
}
