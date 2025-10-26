import express from 'express';
import { sendOtp, verifyOtp, registerUser } from '../controllers/auth.controller.js';
import { otpSendRateLimiter, otpVerifyRateLimiter } from '../middleware/rate-limiter.js';
import { validateSendOtp, validateVerifyOtp, validateRegisterUser } from '../middleware/validation.js';

const router = express.Router();

// Send OTP - Strict rate limiting (5 requests per 15 min)
router.post('/send-otp', otpSendRateLimiter, validateSendOtp, sendOtp);

// Verify OTP - Rate limited (10 requests per 15 min)
router.post('/verify-otp', otpVerifyRateLimiter, validateVerifyOtp, verifyOtp);

// Register new user - With validation
router.post('/register', validateRegisterUser, registerUser);

export default router;