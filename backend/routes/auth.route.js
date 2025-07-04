import express from "express"
import { Login, Register } from "../controllers/Authcontroller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

router.post('/register', Register)
router.post('/login', Login)

router.post('/logout', (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
        // Send a success response
    res.status(200).json({ status: true, message: 'Logged out successfully' });
});

router.get('/get-user', authenticate, (req, res) => {
    res.status(200).json({status: true, user: req.user})
})

export default router;