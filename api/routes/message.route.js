import express from 'express'
import { fetchMessages } from '../controllers/message.controller.js'
import { verifyToken } from '../utils/verifyToken.js'

const router = express.Router()

router.get('/fetchMessages/:userId', fetchMessages)

export default router