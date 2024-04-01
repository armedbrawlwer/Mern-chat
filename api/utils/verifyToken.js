import jwt from 'jsonwebtoken'
import { errorHandler } from './errorHandler.js'


export const verifyToken = async (req, res, next) => {
    const token = req.cookies?.access_token
    // console.log(token)

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                return errorHandler(401, 'unathorized')
            }
            req.user = user;
            res.json(user)
            next()
        })
    }


}