const express = require('express');
const User = require('../models/User');
const router = express.Router();

// POST /auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Username and password are required' }
      });
    }
    
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' }
      });
    }
    
    res.json({ 
      success: true, 
      data: { 
        userId: user._id, 
        username: user.username 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// GET /auth/users - Get all users (for testing)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;