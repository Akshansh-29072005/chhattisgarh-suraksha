import express from 'express';
import { sendOtp, verifyOtp, registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

// Send OTP
router.post('/send-otp', sendOtp);

// Verify OTP
router.post('/verify-otp', verifyOtp);

// Register new user
router.post('/register', registerUser);

export default router;