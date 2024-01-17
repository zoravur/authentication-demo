const { expressjwt: expressJwt } = require('express-jwt');

const requireAuthentication = () => {
  // Middleware for JWT Authentication
  const jwtMiddleware = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
  });

  return (req, res, next) => {
    // Call the JWT Middleware first
    jwtMiddleware(req, res, (err) => {
      if (err) {
        // If an error is thrown by expressJwt, handle it here
        if (err.name === 'UnauthorizedError') {
          // Custom error response for unauthorized access
          res.status(401).json({ error: 'Unauthorized' });
        } else {
          // Forward other errors to your error handler
          next(err);
        }
      } else {
        // If no error, proceed to the next middleware
        next();
      }
    });
  };
};

module.exports = requireAuthentication;
