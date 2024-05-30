const JWT_SECRET = require("../config")
const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res, next) => {
    const header = req.headers?.authorization

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(403).json({
            message: "Invalid Headers"
        })
    }

    const token = header.split(" ")[1]

    if (!token) {
        return res.status(403).json({
            message: "Invalid Headers"
        })
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET)

        if (!verified) {
            return res.status(403).json({
                message: "Access Denied"
            })
        }

        req.userId = verified.userId
        next()
    } catch (e) {
        console.log(e)
        return res.status(403).json({ error: e })
    }
}

module.exports = authMiddleware