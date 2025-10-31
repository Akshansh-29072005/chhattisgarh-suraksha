import { query } from '../config/database.js';

// Get user profile
export const getUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.user;

        // Get user details with position and points
        const userResult = await query(
            `SELECT u.id, u.phone_number, u.full_name, u.email, u.address, u.created_at,
                    pt.name as position_name, pt.icon as position_icon, 
                    up.current_points, up.level, up.progress_to_next_level,
                    (SELECT pt2.name 
                     FROM position_types pt2 
                     WHERE pt2.required_points > up.current_points 
                     ORDER BY pt2.required_points ASC 
                     LIMIT 1) as next_position
             FROM users u
             LEFT JOIN user_positions up ON u.id = up.user_id
             LEFT JOIN position_types pt ON up.position_id = pt.id
             WHERE u.id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Get user achievements
        const achievementsResult = await query(
            `SELECT a.name, a.icon, a.description, ua.achieved_at
             FROM user_achievements ua
             JOIN achievements a ON ua.achievement_id = a.id
             WHERE ua.user_id = $1
             ORDER BY ua.achieved_at DESC`,
            [userId]
        );

        // Format the response
        const response = {
            name: user.full_name,
            email: user.email || '',
            phoneNumber: user.phone_number,
            location: user.address || '',
            joinDate: user.created_at,
            position: {
                title: user.position_name || 'Citizen',
                icon: user.position_icon || 'User',
                level: user.level || 1,
                points: user.current_points || 0,
                progress: user.progress_to_next_level || 0,
                nextMilestone: user.next_position ? `Next: ${user.next_position}` : 'Max Level'
            },
            achievements: achievementsResult.rows,
            status: 'online'
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