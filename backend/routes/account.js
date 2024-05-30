const { Router } = require("express");
const zod = require('zod');
const { Account } = require("../db");
const authMiddleware = require("../middlewares/user");
const { default: mongoose } = require("mongoose");
const accountRouter = Router();

const transferSchema = zod.object({
    to: zod.string(),
    amount: zod.number()
})

accountRouter.get('/balance', authMiddleware, async (req, res) => {
    console.log(req.userId)
    const account = await Account.findOne({ id: req.userId })
    console.log(account)
    if (!account) return res.status(404).json({ error: 'Account not found' })
    return res.status(200).json({ balance: account.balance })
})

accountRouter.post('/transfer', authMiddleware, async (req, res) => {
    const { success } = transferSchema.safeParse(req.body)

    if (!success) {
        return res.status(400).json({ error: 'Invalid request body' })
    }

    const session = await mongoose.startSession()

    session.startTransaction()
    const { to, amount } = req.body

    try {
        const account = await Account.findOne({ userId: req.userId }).session(session)

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Insufficient balance' })
        }

        const toAccount = await Account.findOne({ userId: to }).session(session)

        if (!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Invalid recipient' })
        }

        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session)
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session)

        await session.commitTransaction()

        return res.status(200).json({ message: 'Transfer successful' })
    } catch (e) {
        console.log(e)
        await session.abortTransaction()
        return res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = accountRouter