const User = require('../models/User');

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
  }
};

module.exports = UserController; 