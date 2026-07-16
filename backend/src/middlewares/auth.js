const jwt = require('jwt-simple');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'Signature verification failed') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = authMiddleware;