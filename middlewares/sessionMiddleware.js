import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Middleware to check if session has expired (after 3 days)
const sessionCheck = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the token was issued more than 3 days ago
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const tokenIssuedAt = decoded.iat; // Token issued at time in seconds
      const threeDaysInSeconds = 3 * 24 * 60 * 60; // 3 days in seconds
      
      if ((currentTime - tokenIssuedAt) > threeDaysInSeconds) {
        // Session has expired, clear the cookie and return unauthorized
        res.clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
          expired: true
        });
      }

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      next();
    } catch (error) {
      console.error(`SESSION CHECK ERROR: Token not valid or expired`);
      
      // Clear the invalid/expired token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please log in again.',
        expired: true
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
});

export { sessionCheck };