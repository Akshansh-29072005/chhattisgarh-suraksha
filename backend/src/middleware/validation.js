import { body, param, query, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validation rules
export const validateSendOtp = [
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  handleValidationErrors
];

export const validateVerifyOtp = [
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
  handleValidationErrors
];

export const validateRegisterUser = [
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Full name can only contain letters and spaces'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  handleValidationErrors
];

// Forum validation rules
export const validateCreateTopic = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters')
    .escape(), // Sanitize HTML
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['general', 'safety', 'environmental', 'infrastructure']).withMessage('Invalid category'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters'),
  handleValidationErrors
];

export const validateCreatePost = [
  param('topicId')
    .trim()
    .notEmpty().withMessage('Topic ID is required')
    .isInt({ min: 1 }).withMessage('Invalid topic ID'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters'),
  handleValidationErrors
];

export const validateVote = [
  body('targetType')
    .trim()
    .notEmpty().withMessage('Target type is required')
    .isIn(['topic', 'post']).withMessage('Target type must be either "topic" or "post"'),
  body('targetId')
    .trim()
    .notEmpty().withMessage('Target ID is required')
    .isInt({ min: 1 }).withMessage('Invalid target ID'),
  body('voteType')
    .trim()
    .notEmpty().withMessage('Vote type is required')
    .isIn(['upvote', 'downvote']).withMessage('Vote type must be either "upvote" or "downvote"'),
  handleValidationErrors
];

// Report validation rules
export const validateSubmitReport = [
  body('issueType')
    .trim()
    .notEmpty().withMessage('Issue type is required')
    .isLength({ min: 2, max: 50 }).withMessage('Issue type must be between 2 and 50 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('severity')
    .trim()
    .notEmpty().withMessage('Severity is required')
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  handleValidationErrors
];

// User profile validation rules
export const validateUpdateProfile = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Full name can only contain letters and spaces'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  handleValidationErrors
];

export const validateUpdatePreferences = [
  body('dashboardWidgets')
    .optional()
    .isArray().withMessage('Dashboard widgets must be an array'),
  body('alertThresholds')
    .optional()
    .isObject().withMessage('Alert thresholds must be an object'),
  body('preferredUnits')
    .optional()
    .isObject().withMessage('Preferred units must be an object'),
  handleValidationErrors
];

export const validateUpdateNotificationSettings = [
  body('emailEnabled')
    .optional()
    .isBoolean().withMessage('Email enabled must be a boolean'),
  body('smsEnabled')
    .optional()
    .isBoolean().withMessage('SMS enabled must be a boolean'),
  body('pushEnabled')
    .optional()
    .isBoolean().withMessage('Push enabled must be a boolean'),
  body('alertFrequency')
    .optional()
    .isIn(['realtime', 'hourly', 'daily']).withMessage('Invalid alert frequency'),
  handleValidationErrors
];

// Analytics validation rules
export const validateAnalyticsQuery = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  query('granularity')
    .optional()
    .isIn(['hour', 'day', 'week']).withMessage('Granularity must be hour, day, or week'),
  handleValidationErrors
];

// Map validation rules
export const validateMapBounds = [
  query('minLat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid minimum latitude'),
  query('maxLat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid maximum latitude'),
  query('minLng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid minimum longitude'),
  query('maxLng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid maximum longitude'),
  handleValidationErrors
];

export const validateLocationSearch = [
  body('query')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 2, max: 200 }).withMessage('Search query must be between 2 and 200 characters'),
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateSendOtp,
  validateVerifyOtp,
  validateRegisterUser,
  validateCreateTopic,
  validateCreatePost,
  validateVote,
  validateSubmitReport,
  validateUpdateProfile,
  validateUpdatePreferences,
  validateUpdateNotificationSettings,
  validateAnalyticsQuery,
  validateMapBounds,
  validateLocationSearch
};
