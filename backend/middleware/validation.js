import { check, validationResult } from 'express-validator';

// Validation for signup
export const signupValidation = [
  check('username').notEmpty().withMessage('Username is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  check('role').isIn(['admin', 'editor', 'viewer']).withMessage('Role must be admin, editor, or viewer'),
];

// Validation for login
export const loginValidation = [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').notEmpty().withMessage('Password is required'),
];

// Validation for profile update
export const updateProfileValidation = [
  check('username').notEmpty().withMessage('Username cannot be empty'),
  check('email').isEmail().withMessage('Valid email is required'),
];

// Validation for role update
export const updateRoleValidation = [
  check('role').notEmpty().withMessage('Role cannot be empty'),
];

// Validation for password update
export const updatePasswordValidation = [
  check('currentPassword').notEmpty().withMessage('Current password is required'),
  check('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),
];

// Middleware to handle validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  next();
};