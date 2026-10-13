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
    const createdAt = new Date();
    const result = await db.collection('users').insertOne({
      username,
      email,
      password: passwordHash.toString('hex'),
      passwordSalt,
      UID,
      createdAt,
    });

    const token = jwt.sign(
      { username, email, UID },
      jwtSecret,
      { subject: result.insertedId.toString(), expiresIn: '1h' },
    );

    return res.status(201).json({
      message: 'User created successfully',
      code: 201,
      token,
      user: {
        id: result.insertedId.toString(),
        username,
        email,
        UID,
        createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to create user',
      code: 500,
    });
  }
});

// Get the account associated with a registration token.
registerRoute.get('/', async (req, res) => {
  const { token } = req.query;

  if (typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({
      message: 'A token is required',
      code: 400,
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      message: 'JWT verification secret is not configured',
      code: 500,
    });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret);

    if (
      typeof decodedToken !== 'object' ||
      decodedToken === null ||
      typeof decodedToken.email !== 'string'
    ) {
      return res.status(401).json({
        message: 'Invalid token',
        code: 401,
      });
    }

    const user = await getDatabase().collection('users').findOne({
      email: decodedToken.email,
    });

    if (!user) {
      return res.status(404).json({
        message: 'No account exists for this token',
        code: 404,
      });
    }

    return res.status(200).json({
      message: 'Account retrieved successfully',
      code: 200,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        UID: user.UID,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to fetch account:', error);
    return res.status(500).json({
      message: 'Failed to fetch account',
      code: 500,
    });
  }
});

export default registerRoute;
