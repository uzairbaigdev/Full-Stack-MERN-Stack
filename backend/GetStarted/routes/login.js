import express from 'express';
import jwt from 'jsonwebtoken';
import { scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getDatabase } from '../config/database.js';

const loginRoute = express.Router();
const scrypt = promisify(scryptCallback);

loginRoute.post('/', async (req, res) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
        return res.status(400).json({
            message: 'Email and password are required',
            code: 400,
        });
    }

    try {
        const db = getDatabase();
        const user = await db.collection('users').findOne({
            email: email.trim().toLowerCase(),
        });

        if (!user?.password || !user.passwordSalt) {
            return res.status(401).json({
                message: 'Invalid email or password',
                code: 401,
            });
        }

        const storedPasswordHash = Buffer.from(user.password, 'hex');
        const enteredPasswordHash = await scrypt(password, user.passwordSalt, 64);

        if (
            storedPasswordHash.length !== enteredPasswordHash.length ||
            !timingSafeEqual(storedPasswordHash, enteredPasswordHash)
        ) {
            return res.status(401).json({
                message: 'Invalid email or password',
                code: 401,
            });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                message: 'JWT signing secret is not configured',
                code: 500,
            });
        }

        const token = jwt.sign(
            {
                username: user.username,
                email: user.email,
                UID: user.UID,
            },
            jwtSecret,
            { subject: user._id.toString(), expiresIn: '1h' },
        );

        return res.status(200).json({
            message: 'Login successful',
            code: 200,
            token,
        });
    } catch (error) {
        console.error('Login failed:', error);
        return res.status(500).json({
            message: 'Failed to log in',
            code: 500,
        });
    }
});

export default loginRoute;