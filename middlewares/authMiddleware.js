import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    try {
      token = req.cookies.token;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      next();
    } catch (error) {
      console.error(`\x1b[31m${new Date().toISOString()} AUTH ERROR: Token not valid\x1b[0m`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    console.error(`\x1b[31m${new Date().toISOString()} AUTH ERROR: No token provided\x1b[0m`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
});

// Admin middleware - checks if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    console.error(`\x1b[31m${new Date().toISOString()} AUTH ERROR: Admin access denied\x1b[0m`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

export { protect, admin };