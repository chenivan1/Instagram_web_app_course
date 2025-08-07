const connectDB = require('../db');
const { ObjectId } = require('mongodb');

const useDb = process.env.USE_DB === 'true';

// Create consistent ObjectIds for existing mock users
const mockUser1Id = new ObjectId('507f1f77bcf86cd799439001');
const mockUser2Id = new ObjectId('507f1f77bcf86cd799439002');
const mockUser3Id = new ObjectId('507f1f77bcf86cd799439003');
const mockUser4Id = new ObjectId('507f1f77bcf86cd799439004');
const mockUser5Id = new ObjectId('507f1f77bcf86cd799439005');
const mockUser6Id = new ObjectId('507f1f77bcf86cd799439006');
const mockUser7Id = new ObjectId('507f1f77bcf86cd799439007');
const mockUser8Id = new ObjectId('507f1f77bcf86cd799439008');

let mockUsers = [{
  _id: mockUser1Id,
  id: mockUser1Id.toString(),
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
  _id: mockUser2Id,
  id: mockUser2Id.toString(),
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
  _id: mockUser3Id,
  id: mockUser3Id.toString(),
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
}, {
  _id: mockUser4Id,
  id: mockUser4Id.toString(),
  name: 'Alice Johnson',
  email: 'alice.johnson@example.com',
  password: 'password123',
  isAdmin: false,
  profilePicture: null,
  address: {
    name: "101 Pine Street, San Francisco, CA 94102",
    lat: 37.7749,
    lng: -122.4194,
  },
  createdAt: new Date(),
}, {
  _id: mockUser5Id,
  id: mockUser5Id.toString(),
  name: 'Bob Wilson',
  email: 'bob.wilson@example.com',
  password: 'password123',
  isAdmin: false,
  profilePicture: null,
  address: {
    name: "202 Elm Avenue, Austin, TX 78701",
    lat: 30.2672,
    lng: -97.7431,
  },
  createdAt: new Date(),
}, {
  _id: mockUser6Id,
  id: mockUser6Id.toString(),
  name: 'Carol Davis',
  email: 'carol.davis@example.com',
  password: 'password123',
  isAdmin: false,
  profilePicture: null,
  address: {
    name: "303 Maple Drive, Seattle, WA 98101",
    lat: 47.6062,
    lng: -122.3321,
  },
  createdAt: new Date(),
}, {
  _id: mockUser7Id,
  id: mockUser7Id.toString(),
  name: 'David Brown',
  email: 'david.brown@example.com',
  password: 'password123',
  isAdmin: false,
  profilePicture: null,
  address: {
    name: "404 Cedar Lane, Miami, FL 33101",
    lat: 25.7617,
    lng: -80.1918,
  },
  createdAt: new Date(),
}, {
  _id: mockUser8Id,
  id: mockUser8Id.toString(),
  name: 'Emma Garcia',
  email: 'emma.garcia@example.com',
  password: 'password123',
  isAdmin: false,
  profilePicture: null,
  address: {
    name: "505 Birch Road, Denver, CO 80201",
    lat: 39.7392,
    lng: -104.9903,
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
      return db.collection('users').findOne({ id: id });
    } else {
      return mockUsers.find(u => u.id === id);
    }
  },
  async create(data) {
    if (useDb) {
      const db = await connectDB();
      // Generate a new ObjectId
      const objectId = new ObjectId();
      // Create user data with both _id (ObjectId) and id (string)
      const userData = {
        _id: objectId,
        id: objectId.toString(),
        ...data
      };
      const result = await db.collection('users').insertOne(userData);
      return userData;
    } else {
      // For mock data, generate a new ObjectId and use it for both _id and id
      const objectId = new ObjectId();
      const user = { 
        _id: objectId,
        id: objectId.toString(),
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
        { id: id },
        { $set: data },
        { returnDocument: 'after' }
      );
      return result;
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
      const result = await db.collection('users').findOneAndDelete({ id: id });
      return result;
    } else {
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) return null;
      const [deleted] = mockUsers.splice(idx, 1);
      return deleted;
    }
  },
};

module.exports = UserModel; 