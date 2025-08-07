const User = require('../models/User');
const SessionManager = require('../sessionManager');
const path = require('path');

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
    const { email, password, full_name, address, profilePicture } = req.body;
    
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
    
    // Validate profile picture if provided
    if (profilePicture && typeof profilePicture !== 'string') {
      return res.status(400).json({ error: 'Profile picture must be a valid base64 string' });
    }
    
    // Validate base64 format if profile picture is provided
    if (profilePicture) {
      const base64Regex = /^data:image\/(jpeg|jpg|png|gif|bmp|webp);base64,/;
      if (!base64Regex.test(profilePicture)) {
        return res.status(400).json({ error: 'Profile picture must be a valid base64 image (JPEG, PNG, GIF, BMP, or WebP)' });
      }
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
        isAdmin: false, // New users are not admins by default
        profilePicture: profilePicture || null, // Store base64 image or null
        address: {
          name: address.name,
          lat: address.latitude,
          lng: address.longitude,
        },
        createdAt: new Date(),
      };
      
      // Create the user
      const newUser = await User.create(userData);
      
      // Automatically log in the user after successful registration
      SessionManager.setLoggedInUser(newUser);
      
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
      
      SessionManager.setLoggedInUser(user);
      
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
  },
  async logoutUser(req, res) {
    SessionManager.logout();
    res.json({ 
      message: 'Logout successful', 
      success: true 
    });
  },
  // User Management methods
  async getUserManagementPage(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    res.sendFile(path.join(__dirname, '../views/user-management/user-management.html'));
  },
  async searchUsers(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    const { query, dateFrom, dateTo, userRole } = req.query;
    
    try {
      const users = await User.find();
      let filteredUsers = users;
      
      // Filter by name
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm)
        );
      }
      
      // Filter by registration date range
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredUsers = filteredUsers.filter(user => {
          const userCreatedAt = new Date(user.createdAt);
          return userCreatedAt >= fromDate;
        });
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        filteredUsers = filteredUsers.filter(user => {
          const userCreatedAt = new Date(user.createdAt);
          return userCreatedAt <= toDate;
        });
      }
      
      // Filter by user role
      if (userRole && userRole !== '') {
        const isAdminFilter = userRole === 'admin';
        filteredUsers = filteredUsers.filter(user => 
          user.isAdmin === isAdminFilter
        );
      }
      
      // Return users without passwords
      const usersWithoutPasswords = filteredUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async deleteUserById(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === currentUser.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    try {
      // Check if target user is admin before deletion
      const targetUser = await User.findById(id);
      if (targetUser && targetUser.isAdmin) {
        return res.status(400).json({ error: 'Cannot delete admin users' });
      }
    } catch (error) {
      console.error('Error checking target user:', error);
    }
    
    try {
      const deletedUser = await User.delete(id);
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async toggleUserRole(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    const { id } = req.params;
    
    try {
      const targetUser = await User.findById(id);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Prevent admins from changing other admin users' roles
      if (targetUser.isAdmin) {
        return res.status(400).json({ error: 'Cannot modify admin user roles' });
      }
      
      // Toggle the admin status
      const updatedUser = await User.update(id, { isAdmin: !targetUser.isAdmin });
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const action = updatedUser.isAdmin ? 'promoted to admin' : 'removed from admin';
      res.json({ message: `User ${action} successfully`, user: updatedUser });
    } catch (error) {
      console.error('Toggle user role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async getCurrentUser(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }
    
    try {
      // Return user data without password
      const { password, ...userWithoutPassword } = currentUser;
      res.json({ 
        user: userWithoutPassword,
        success: true 
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = UserController; 