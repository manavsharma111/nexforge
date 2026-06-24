const express = require('express')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { aiUserSupport } = require('../controllers/ai.controller')
const router = express.Router()


router.post('/AskAI', authMiddleware, aiUserSupport )

module.exports = router