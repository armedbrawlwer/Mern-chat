import express from 'express'
import { signup, signin, signout } from '../controllers/auth.controller.js'
import { verifyToken } from '../utils/verifyToken.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/signin', signin)
router.get('/profile', verifyToken)
router.post('/signout', signout)

export default router