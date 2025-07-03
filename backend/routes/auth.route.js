import express from "express"
import { Login, Register } from "../controllers/Authcontroller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

router.post('/register', Register)
router.post('/login', Login)

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true, // Should match how it was set
        secure: process.env.NODE_ENV === 'production', // Use true in production for HTTPS
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust based on your cookie settings
    });
        // Send a success response
    res.status(200).json({ status: true, message: 'Logged out successfully' });
});

router.get('/get-user', authenticate, (req, res) => {
    res.status(200).json({status: true, user: req.user})
})

export default router;