import { query } from '../config/database.js';

// Get user profile
export const getUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.user;

        // Get user details
        const userResult = await query(
            'SELECT id, phone_number, full_name, email, address, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Format the response
        const response = {
            name: user.full_name,
            email: user.email || '',
            phoneNumber: user.phone_number,
            location: user.address || '',
            userType: 'Citizen', // Default type
            bio: '', // Can be added to database later
            joinDate: user.created_at,
            interests: [], // Can be added to database later
            twoFactorEnabled: false, // Can be added to database later
            emailNotifications: true, // Default value
            smsNotifications: true, // Default value
            marketingEmails: false, // Default value
            dataSharing: true // Default value
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { fullName, email, address } = req.body;

        // Update user details
        const result = await query(
            'UPDATE users SET full_name = $1, email = $2, address = $3 WHERE id = $4 RETURNING *',
            [fullName, email, address, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        res.status(200).json({
            name: user.full_name,
            email: user.email,
            phoneNumber: user.phone_number,
            location: user.address
        });
    } catch (error) {
        next(error);
    }
};