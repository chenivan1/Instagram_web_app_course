const { ObjectId } = require('mongodb');
const connectDB = require('../db');

const useDb = false;

let mockUsers = [{
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password',
  isAdmin: true,
  profilePicture: null, // Will be defined later
  address: {
    name: "123 Main Street, New York, NY 10001",
    lat: 40.7128,
    lng: -74.0060,
  },
  createdAt: new Date(),
}, {
  id: '2',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  password: 'password',
  isAdmin: false,
  profilePicture: null, // Will be defined later
  address: {
    name: "456 Oak Avenue, Los Angeles, CA 90210",
    lat: 34.0522,
    lng: -118.2437,
  },
  createdAt: new Date(),
}, {
  id: '3',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  isAdmin: true,
  profilePicture: null, // Will be defined later
  address: {
    name: "789 Admin Street, Chicago, IL 60601",
    lat: 41.8781,
    lng: -87.6298,
  },
  createdAt: new Date(),
}];

const UserModel = {
  async find() {
    if (useDb) {
      const db = await connectDB();
      return db.collection('users').find().toArray();
    } else {
      return mockUsers;
    }
  },
  async findById(id) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('users').findOne({ _id: new ObjectId(id) });
    } else {
      return mockUsers.find(u => u.id === id);
    }
  },
  async create(data) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('users').insertOne(data);
      return { _id: result.insertedId, ...data };
    } else {
      const user = { 
        id: String(Date.now()), 
        ...data,
        profilePicture: data.profilePicture || null // Ensure profilePicture field exists
      };
      mockUsers.push(user);
      return user;
    }
  },
  async update(id, data) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: 'after' }
      );
      return result.value;
    } else {
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) return null;
      mockUsers[idx] = { ...mockUsers[idx], ...data };
      return mockUsers[idx];
    }
  },
  async delete(id) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('users').findOneAndDelete({ _id: new ObjectId(id) });
      return result.value;
    } else {
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) return null;
      const [deleted] = mockUsers.splice(idx, 1);
      return deleted;
    }
  },
};

module.exports = UserModel; 