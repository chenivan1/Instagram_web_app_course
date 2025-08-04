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
  async registerUser(req, res) {
    const { email, password, full_name, address } = req.body;
    
    // Validate required fields
    if (!email || !password || !full_name || !address) {
      return res.status(400).json({ error: 'Email, password, full name, and address are required' });
    }
    
    // Validate address structure
    if (!address.name || typeof address.latitude !== 'number' || typeof address.longitude !== 'number') {
      return res.status(400).json({ error: 'Address must include name, latitude, and longitude' });
    }
    
    // Validate latitude and longitude ranges
    if (address.latitude < -90 || address.latitude > 90) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90 degrees' });
    }
    
    if (address.longitude < -180 || address.longitude > 180) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180 degrees' });
    }
    
    try {
      // Check if user already exists
      const users = await User.find();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists with this email' });
      }
      
      // Create user data with proper address format
      const userData = {
        name: full_name,
        email: email,
        password: password,
        address: {
          name: address.name,
          lat: address.latitude,
          lng: address.longitude,
        },
        createdAt: new Date(),
      };
      
      // Create the user
      const newUser = await User.create(userData);
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ 
        message: 'Registration successful', 
        user: userWithoutPassword,
        success: true 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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