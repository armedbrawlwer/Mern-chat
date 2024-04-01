import User from '../models/user.model.js'
import { errorHandler } from '../utils/errorHandler.js'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

export const signup = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return (next(errorHandler(400, 'all field required')))
        }

        const hashedPassword = bcryptjs.hashSync(password, 10)
        const newUser = new User({
            username,
            password: hashedPassword
        })
        const useradd = await newUser.save()

        const token = jwt.sign({
            id: useradd._id,
            username: useradd.username
        }, process.env.SECRET_KEY, {
            expiresIn: "2h"
        })

        res.status(200).cookie('access_token', token, { httpOnly: true, secure: true, sameSite: 'none' })
            .json(useradd)

        // res.status(200).json(useradd)
    } catch (err) {
        next(err)
    }
}

export const signin = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return (next(errorHandler(400, 'all field required')))
    }

    try {
        const validUser = await User.findOne({ username })
        if (!validUser) {
            return (next(errorHandler(404, 'not a valid user')))
        }

        const validpwd = bcryptjs.compareSync(password, validUser.password)
        if (!validpwd) {
            return (next(errorHandler(404, 'not a valid pwd')))
        }

        const token = jwt.sign({
            id: validUser._id,
            username: validUser.username
        }, process.env.SECRET_KEY, {
            expiresIn: "2h"
        })

        res.status(200).cookie('access_token', token, { httpOnly: true, secure: true, sameSite: 'none' })
            .json({
                validUser,
                message: 'successfull signin'
            })

    } catch (e) {
        next(e)
    }
}

export const signout = async (req, res, next) => {
    try {
        res.clearCookie('access_token').status(200).json('user signed out')
    } catch (e) {
        next(e)
    }
}

