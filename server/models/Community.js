const { ObjectId } = require('mongodb');
const connectDB = require('../db');

const useDb = process.env.USE_DB === 'true';

let mockCommunities = [
  {
    id: '1',
    name: 'Tech Enthusiasts',
    description: 'A community for technology lovers to share and discuss the latest tech trends, gadgets, and innovations.',
    managerId: '1',
    managerName: 'John Doe',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Photography Club',
    description: 'Share your best shots, get feedback, and learn new photography techniques from fellow photographers.',
    managerId: '2',
    managerName: 'Jane Doe',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    name: 'Food & Recipes',
    description: 'Discover delicious recipes, share your culinary creations, and connect with food enthusiasts.',
    managerId: '3',
    managerName: 'Admin User',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: '4',
    name: 'Travel Adventures',
    description: 'Share your travel experiences, discover new destinations, and get travel tips from fellow adventurers.',
    managerId: '1',
    managerName: 'John Doe',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04')
  },
  {
    id: '5',
    name: 'Fitness & Health',
    description: 'Motivate each other on fitness journeys, share workout routines, and discuss healthy lifestyle tips.',
    managerId: '2',
    managerName: 'Jane Doe',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

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