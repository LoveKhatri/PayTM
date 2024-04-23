const { Router } = require("express");
const zod = require('zod');
const { User, Account } = require("../db");
const jwt = require('jsonwebtoken');
const JWT_SECRET = require("../config");
const userRouter = Router();
const authMiddleware = require('../middlewares/user')


const signUpScheme = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

const signInSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

const updateSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

userRouter.post('/signup', async (req, res) => {
    const body = req.body;

    const { success } = signUpScheme.safeParse(body)

    if (!success) {
        return res.status(411).json({
            message: "Invalid Data!"
        })
    }

    const alreadyExists = User.findOne({ username: body.username })

    if (alreadyExists) {
        return res.status(411).json({ message: "Username Already Taken" })
    }

    const user = await User.create({
        username: body.username,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName
    })

    await Account.create({
        userId: user._id,
        balance: 1 + (Math.random() * 10000)
    })

    const token = jwt.sign({ userId: user._id }, JWT_SECRET)

    return res.status(200).json({ message: "User Created Successfully", token: token })
})

userRouter.post('/signin', async (req, res) => {
    try {
        const body = req.body
        const { success } = signInSchema.safeParse(body)

        if (!success) {
            return res.status(411).json({
                message: "Invalid Data"
            })
        }

        const user = User.findOne({ username: body.username, password: body.password })

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET)

        return res.status(200).json({ token: token })
    }
    catch (e) {
        return res.status(411).json({
            message: "Error while logging in"
        })
    }
})

userRouter.put('/update', authMiddleware, async (req, res) => {
    const { success } = updateSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Invalid Data"
        })
    }

    await User.updateOne({ id: req.userId }, req.body)

    return res.status(200).json({
        message: "Updated Successfully"
    })
})

userRouter.get('/bulk', authMiddleware, async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{ firstName: { $regex: filter } },
        { lastName: { $regex: filter } }]
    })

    res.json({
        user: users.map(user => {
            return {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }
        })
    })
})

module.exports = userRouter