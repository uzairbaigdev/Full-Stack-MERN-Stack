import Joi from 'joi';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(3)
    .max(15)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be no more than 15 characters long',
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(254)
    .required(),
  password: Joi.string()
    .max(128)
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.max': 'Password must be no more than 128 characters long',
      'string.pattern.base':
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character',
    }),
})
  .required()
  .unknown(false);

export default registerSchema;
