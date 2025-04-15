import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        res.status(400).json({ errors: errors.array() });
    };
};

// Validation middleware for user registration
export const validateRegistration = validate([
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter'),
    body('name')
        .trim()
        .isLength({ min: 4 })
        .withMessage('Name must be at least 4 characters long'),
]);

// Validation middleware for user login
export const validateLogin = validate([
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
]);

// Validation middleware for updating user profile
export const validateProfileUpdate = validate([
    body('name')
        .optional()
        .trim()
        .isLength({ min: 4 })
        .withMessage('Name must be at least 4 characters long'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
]); 