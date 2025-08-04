const { ObjectId } = require('mongodb');
const connectDB = require('../db');

const useDb = false; // Following existing pattern in User.js

let mockCommunities = [];

const CommunityModel = {
  async find() {
    if (useDb) {
      const db = await connectDB();
      return db.collection('communities').find().toArray();
    } else {
      return mockCommunities;
    }
  },
  
  async findById(id) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('communities').findOne({ _id: new ObjectId(id) });
    } else {
      return mockCommunities.find(c => c.id === id);
    }
  },
  
  async findByName(name) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('communities').findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    } else {
      return mockCommunities.find(c => c.name.toLowerCase() === name.toLowerCase());
    }
  },
  
  async create(data) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('communities').insertOne(data);
      return { _id: result.insertedId, ...data };
    } else {
      const community = { 
        id: String(Date.now()), 
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockCommunities.push(community);
      return community;
    }
  },
  
  async update(id, data) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('communities').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result.value;
    } else {
      const idx = mockCommunities.findIndex(c => c.id === id);
      if (idx === -1) return null;
      mockCommunities[idx] = { 
        ...mockCommunities[idx], 
        ...data, 
        updatedAt: new Date() 
      };
      return mockCommunities[idx];
    }
  },
  
  async delete(id) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('communities').findOneAndDelete({ _id: new ObjectId(id) });
      return result.value;
    } else {
      const idx = mockCommunities.findIndex(c => c.id === id);
      if (idx === -1) return null;
      const [deleted] = mockCommunities.splice(idx, 1);
      return deleted;
    }
  }
};

module.exports = CommunityModel;