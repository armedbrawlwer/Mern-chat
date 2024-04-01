import jwt from 'jsonwebtoken'

export const getUserData = async (req) => {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.access_token;
        if (token) {
            jwt.verify(token, process.env.SECRET_KEY, (err, userData) => {
                if (err) throw err;
                resolve(userData)
            })
        } else {
            reject('no token')
        }
    });
}