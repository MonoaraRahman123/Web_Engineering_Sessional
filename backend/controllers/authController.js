const jwt = require('jsonwebtoken');

// Hardcoded Admin Credentials as specified in the lab prompt
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin_edtech';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_edtech_2026';

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both username and password.',
    });
  }

  // Verify against hardcoded credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const payload = {
      username: ADMIN_USERNAME,
      role: 'admin',
    };

    // Sign JWT token valid for 24 hours
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        username: ADMIN_USERNAME,
        role: 'admin',
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid username or password.',
  });
};

// @desc    Verify existing token
// @route   GET /api/auth/verify
// @access  Protected
exports.verifyToken = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
