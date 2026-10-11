import express from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { getDatabase } from '../config/database.js';
import registerSchema from '../schemas/registerSchema.js';
const registerRoute = express.Router();
const scrypt = promisify(scryptCallback);

//API of creating a new user
registerRoute.post('/', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: 'Invalid registration data',
      code: 400,
      errors: error.details.map(({ path, message }) => ({
        field: path.join('.'),
        message,
      })),
    });
  }

  try {
    const { username, email, password } = value;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        message: 'JWT signing secret is not configured',
        code: 500,
      });
    }

    const db = getDatabase();
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'A user with this email already exists',
        code: 409,
      });
    }

    const UID = Math.floor(Math.random() * 1000000);
    const passwordSalt = randomBytes(16).toString('hex');
    const passwordHash = await scrypt(password, passwordSalt, 64);
    const result = await db.collection('users').insertOne({
      username,
      email,
      password: passwordHash.toString('hex'),
      passwordSalt,
      UID,
      createdAt: new Date()
    });

    const token = jwt.sign(
      { username, email, UID },
      jwtSecret,
      { subject: result.insertedId.toString(), expiresIn: '1h' },
    );

    return res.status(201).json({
      message: 'User created successfully',
      code: 201,
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to create user',
      code: 500,
    });
  }
});

export default registerRoute;
