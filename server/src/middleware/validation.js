import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ errors: errors.array() });
    };
};

export const userValidation = [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').not().isEmpty().withMessage('Name is required')
];

export const shipmentValidation = [
    body('trackingNumber').not().isEmpty().withMessage('Tracking number is required'),
    body('status').isIn(['pending', 'in-transit', 'delivered', 'exception']).withMessage('Invalid status')
];
