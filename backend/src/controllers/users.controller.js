import { query } from '../config/database.js';
import { deleteCache } from '../config/redis.js';
import logger from '../utils/logger.js';

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

        // Invalidate user caches
        await deleteCache(`cache:user:session:${userId}`);
        await deleteCache(`cache:user:preferences:${userId}`);

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

// Get user preferences
export const getUserPreferences = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const result = await query(
            'SELECT * FROM user_preferences WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Create default preferences if they don't exist
            const defaultPrefs = {
                dashboard_widgets: JSON.stringify(['aqi', 'temperature', 'humidity', 'alerts']),
                alert_thresholds: JSON.stringify({ aqi: 150, temperature: 40, humidity: 80 }),
                preferred_units: JSON.stringify({ temperature: 'celsius', distance: 'km' })
            };

            await query(
                `INSERT INTO user_preferences (user_id, dashboard_widgets, alert_thresholds, preferred_units)
                 VALUES ($1, $2, $3, $4)`,
                [userId, defaultPrefs.dashboard_widgets, defaultPrefs.alert_thresholds, defaultPrefs.preferred_units]
            );

            return res.json({
                dashboardWidgets: JSON.parse(defaultPrefs.dashboard_widgets),
                alertThresholds: JSON.parse(defaultPrefs.alert_thresholds),
                preferredUnits: JSON.parse(defaultPrefs.preferred_units)
            });
        }

        const prefs = result.rows[0];
        res.json({
            dashboardWidgets: prefs.dashboard_widgets || [],
            alertThresholds: prefs.alert_thresholds || {},
            preferredUnits: prefs.preferred_units || {}
        });
    } catch (error) {
        logger.error('Error fetching user preferences:', error);
        next(error);
    }
};

// Update user preferences
export const updateUserPreferences = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { dashboardWidgets, alertThresholds, preferredUnits } = req.body;

        // Check if preferences exist
        const existingResult = await query(
            'SELECT user_id FROM user_preferences WHERE user_id = $1',
            [userId]
        );

        if (existingResult.rows.length === 0) {
            // Insert new preferences
            await query(
                `INSERT INTO user_preferences (user_id, dashboard_widgets, alert_thresholds, preferred_units)
                 VALUES ($1, $2, $3, $4)`,
                [
                    userId,
                    JSON.stringify(dashboardWidgets),
                    JSON.stringify(alertThresholds),
                    JSON.stringify(preferredUnits)
                ]
            );
        } else {
            // Update existing preferences
            const updates = [];
            const params = [];
            let paramIndex = 1;

            if (dashboardWidgets) {
                updates.push(`dashboard_widgets = $${paramIndex}`);
                params.push(JSON.stringify(dashboardWidgets));
                paramIndex++;
            }
            if (alertThresholds) {
                updates.push(`alert_thresholds = $${paramIndex}`);
                params.push(JSON.stringify(alertThresholds));
                paramIndex++;
            }
            if (preferredUnits) {
                updates.push(`preferred_units = $${paramIndex}`);
                params.push(JSON.stringify(preferredUnits));
                paramIndex++;
            }

            if (updates.length > 0) {
                updates.push('updated_at = NOW()');
                params.push(userId);
                await query(
                    `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`,
                    params
                );
            }
        }

        // Invalidate cache
        await deleteCache(`cache:user:preferences:${userId}`);

        logger.info('User preferences updated', { userId });
        res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
        logger.error('Error updating user preferences:', error);
        next(error);
    }
};

// Get notification settings
export const getNotificationSettings = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const result = await query(
            'SELECT * FROM user_notification_settings WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Create default settings
            await query(
                `INSERT INTO user_notification_settings (user_id)
                 VALUES ($1)`,
                [userId]
            );

            return res.json({
                emailEnabled: true,
                smsEnabled: false,
                pushEnabled: true,
                alertFrequency: 'realtime',
                quietHours: null
            });
        }

        const settings = result.rows[0];
        res.json({
            emailEnabled: settings.email_enabled,
            smsEnabled: settings.sms_enabled,
            pushEnabled: settings.push_enabled,
            alertFrequency: settings.alert_frequency,
            quietHours: settings.quiet_hours_start && settings.quiet_hours_end ? {
                start: settings.quiet_hours_start,
                end: settings.quiet_hours_end
            } : null
        });
    } catch (error) {
        logger.error('Error fetching notification settings:', error);
        next(error);
    }
};

// Update notification settings
export const updateNotificationSettings = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { emailEnabled, smsEnabled, pushEnabled, alertFrequency, quietHours } = req.body;

        // Check if settings exist
        const existingResult = await query(
            'SELECT user_id FROM user_notification_settings WHERE user_id = $1',
            [userId]
        );

        if (existingResult.rows.length === 0) {
            // Insert new settings
            await query(
                `INSERT INTO user_notification_settings
                 (user_id, email_enabled, sms_enabled, push_enabled, alert_frequency, quiet_hours_start, quiet_hours_end)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    userId,
                    emailEnabled !== undefined ? emailEnabled : true,
                    smsEnabled !== undefined ? smsEnabled : false,
                    pushEnabled !== undefined ? pushEnabled : true,
                    alertFrequency || 'realtime',
                    quietHours?.start || null,
                    quietHours?.end || null
                ]
            );
        } else {
            // Update existing settings
            const updates = [];
            const params = [];
            let paramIndex = 1;

            if (emailEnabled !== undefined) {
                updates.push(`email_enabled = $${paramIndex}`);
                params.push(emailEnabled);
                paramIndex++;
            }
            if (smsEnabled !== undefined) {
                updates.push(`sms_enabled = $${paramIndex}`);
                params.push(smsEnabled);
                paramIndex++;
            }
            if (pushEnabled !== undefined) {
                updates.push(`push_enabled = $${paramIndex}`);
                params.push(pushEnabled);
                paramIndex++;
            }
            if (alertFrequency) {
                updates.push(`alert_frequency = $${paramIndex}`);
                params.push(alertFrequency);
                paramIndex++;
            }
            if (quietHours) {
                updates.push(`quiet_hours_start = $${paramIndex}, quiet_hours_end = $${paramIndex + 1}`);
                params.push(quietHours.start, quietHours.end);
                paramIndex += 2;
            }

            if (updates.length > 0) {
                updates.push('updated_at = NOW()');
                params.push(userId);
                await query(
                    `UPDATE user_notification_settings SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`,
                    params
                );
            }
        }

        logger.info('Notification settings updated', { userId });
        res.json({ message: 'Notification settings updated successfully' });
    } catch (error) {
        logger.error('Error updating notification settings:', error);
        next(error);
    }
};

// Get user impact statistics
export const getUserImpactStats = async (req, res, next) => {
    try {
        const { userId } = req.user;

        // Count forum posts and topics
        const forumStatsQuery = `
            SELECT
                (SELECT COUNT(*) FROM forum_topics WHERE user_id = $1) as topics_count,
                (SELECT COUNT(*) FROM forum_posts WHERE user_id = $1) as posts_count,
                (SELECT COUNT(*) FROM forum_votes WHERE user_id = $1) as votes_count
        `;
        const forumStats = await query(forumStatsQuery, [userId]);

        const communityInteractions =
            parseInt(forumStats.rows[0].topics_count) +
            parseInt(forumStats.rows[0].posts_count) +
            parseInt(forumStats.rows[0].votes_count);

        // Calculate environmental score (simple formula)
        // Reports * 10 + Community interactions * 2
        const reportsSubmitted = 0; // Will be counted from blockchain in production
        const dataPointsContributed = reportsSubmitted; // Can be expanded later
        const environmentalScore = (reportsSubmitted * 10) + (communityInteractions * 2);

        res.json({
            reportsSubmitted,
            communityInteractions,
            dataPointsContributed,
            environmentalScore
        });
    } catch (error) {
        logger.error('Error fetching user impact stats:', error);
        next(error);
    }
};