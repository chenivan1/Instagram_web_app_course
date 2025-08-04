const User = require('../models/User');

// Simple in-memory session storage (in production, use proper session management)
let loggedInUsers = new Set();

const UserController = {
  async getAllUsers(_, res) {
    const users = await User.find();
    res.json(users);
  },
  async getUserById(req, res) {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  },
  async createUser(req, res) {
    const user = await User.create(req.body);
    res.status(201).json(user);
  },
  async updateUser(req, res) {
    const user = await User.update(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  },
  async deleteUser(req, res) {
    const user = await User.delete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', user });
  },
  async loginUser(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
      const users = await User.find();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found or invalid credentials' });
      }
      
      // Add user to logged in users (simple session-like storage)
      loggedInUsers.add(user.id);
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        message: 'Login successful', 
        user: userWithoutPassword,
        success: true 
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = UserController; 