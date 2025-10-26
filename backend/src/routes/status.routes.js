import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Basic status check endpoint
router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Check user status
router.get('/check/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const userResult = await query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phoneNumber]
    );
    const otpResults = await query(
      'SELECT * FROM otps WHERE phone_number = $1 ORDER BY created_at DESC LIMIT 5',
      [phoneNumber]
    );
    
    console.log('\n==================================');
    console.log('📱 User Status Check:');
    console.log('User:', userResult.rows[0]);
    console.log('Recent OTPs:', otpResults.rows);
    console.log('==================================\n');

    res.json({
      userExists: userResult.rows.length > 0,
      user: userResult.rows[0],
      recentOtps: otpResults.rows
    });
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;