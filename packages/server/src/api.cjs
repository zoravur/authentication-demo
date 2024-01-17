const express = require('express');
const router = express.Router();
const { db } = require('./db.cjs');
const { apiLogger } = require('./logging.cjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const util = require('util');
const { expressjwt: expressJwt } = require('express-jwt');
const requireAuthentication = require('./auth.cjs');

// Sign Up (User Registration)
router.post(
  '/users/signup',
  [
    body('username').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      let user = await db.getUserByEmail(email);
      if (user) {
        return res.status(409).json({ error: 'User already exists' });
      }
      user = await db.createUser(username, email, password);

      // Return user details (excluding password) with HTTP 201 (Created) status
      res.status(201).json({
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      // Handle error
      apiLogger.error(util.format(error));
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

// Configure rate limiting
// TODO: Implement rate limiting by IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 5 requests per windowMs
  message: 'Too many login attempts. Please try again later.',
});

// Sign In (User Authentication)
router.post('/users/signin', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by username or email
    if (!(await db.verifyUserPassword(email, password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate authentication token (JWT)
    const token = jwt.sign({ userId: email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Return authentication token
    res.status(200).json({ token });
  } catch (error) {
    apiLogger.error(util.format(error));
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Reset Password
router.post('/users/requestPasswordReset', (req, res) => {
  // Implementation for requesting password reset
});

router.post('/users/resetPassword', (req, res) => {
  // Implementation for performing password reset
});

// View Account Information
router.get(
  // '/users/:userId/info',
  '/users/me',
  requireAuthentication(),
  // expressJwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }),
  async (req, res) => {
    console.log(req.auth);

    const userId = req.auth.userId;

    // Get user from database based on userId (email)
    const user = await db.getUserByEmail(userId);

    // Return user details (excluding password) with HTTP 200 (OK) status
    res.status(200).json({
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
    });
  },
);

module.exports = router;
