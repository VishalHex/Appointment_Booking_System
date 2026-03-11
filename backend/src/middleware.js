import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('name').isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export function errorHandler(err, req, res, next) {
  req.app.get('logger').error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
}
