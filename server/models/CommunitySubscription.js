const connectDB = require('../db');
const { ObjectId } = require('mongodb');

const useDb = process.env.USE_DB === 'true';

let mockSubscriptions = [
  // John Doe subscriptions
  {
    id: '1',
    userId: '1',
    communityId: '1', // Tech Enthusiasts (he manages this)
    subscribedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    userId: '1',
    communityId: '2', // Photography Club
    subscribedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    userId: '1',
    communityId: '3', // Food & Recipes
    subscribedAt: new Date('2024-01-03')
  },
  
  // Jane Doe subscriptions
  {
    id: '4',
    userId: '2',
    communityId: '1', // Tech Enthusiasts
    subscribedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    userId: '2',
    communityId: '2', // Photography Club (she manages this)
    subscribedAt: new Date('2024-01-02')
  },
  {
    id: '6',
    userId: '2',
    communityId: '4', // Travel Adventures
    subscribedAt: new Date('2024-01-04')
  },
  
  // Admin User subscriptions
  {
    id: '7',
    userId: '3',
    communityId: '1', // Tech Enthusiasts
    subscribedAt: new Date('2024-01-01')
  },
  {
    id: '8',
    userId: '3',
    communityId: '2', // Photography Club
    subscribedAt: new Date('2024-01-02')
  },
  {
    id: '9',
    userId: '3',
    communityId: '3', // Food & Recipes (he manages this)
    subscribedAt: new Date('2024-01-03')
  },
  {
    id: '10',
    userId: '3',
    communityId: '4', // Travel Adventures
    subscribedAt: new Date('2024-01-04')
  },
  {
    id: '11',
    userId: '3',
    communityId: '5', // Fitness & Health
    subscribedAt: new Date('2024-01-05')
  }
];

const CommunitySubscriptionModel = {
  async find(query = {}) {
    if (useDb) {
      const db = await connectDB();
      const subscriptions = await db.collection('community_subscriptions').find(query).toArray();
      return subscriptions.map(sub => ({
        ...sub,
        id: sub._id.toString()
      }));
    } else {
      if (Object.keys(query).length === 0) {
        return mockSubscriptions;
      }
      
      // Handle simple queries
      return mockSubscriptions.filter(sub => {
        return Object.entries(query).every(([key, value]) => sub[key] === value);
      });
    }
  },
  
  async findByUserAndCommunity(userId, communityId) {
    if (useDb) {
      const db = await connectDB();
      const subscription = await db.collection('community_subscriptions').findOne({ 
        userId: userId, 
        communityId: communityId 
      });
      if (subscription) {
        return {
          ...subscription,
          id: subscription._id.toString()
        };
      }
      return null;
    } else {
      return mockSubscriptions.find(sub => 
        sub.userId === userId && sub.communityId === communityId
      );
    }
  },
  
  async getUserSubscriptions(userId) {
    if (useDb) {
      const db = await connectDB();
      const subscriptions = await db.collection('community_subscriptions').find({ userId: userId }).toArray();
      return subscriptions.map(sub => ({
        ...sub,
        id: sub._id.toString()
      }));
    } else {
      return mockSubscriptions.filter(sub => sub.userId === userId);
    }
  },
  
  async getCommunitySubscribers(communityId) {
    if (useDb) {
      const db = await connectDB();
      const subscriptions = await db.collection('community_subscriptions').find({ communityId: communityId }).toArray();
      return subscriptions.map(sub => ({
        ...sub,
        id: sub._id.toString()
      }));
    } else {
      return mockSubscriptions.filter(sub => sub.communityId === communityId);
    }
  },
  
  async create(data) {
    if (useDb) {
      const db = await connectDB();
      const subscriptionData = {
        ...data,
        id: new ObjectId().toString(),
        subscribedAt: new Date()
      };
      const result = await db.collection('community_subscriptions').insertOne(subscriptionData);
      return { 
        _id: result.insertedId, 
        ...subscriptionData,
        id: result.insertedId.toString()
      };
    } else {
      const subscription = { 
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
        ...data,
        subscribedAt: new Date()
      };
      mockSubscriptions.push(subscription);
      return subscription;
    }
  },
  
  async deleteByUserAndCommunity(userId, communityId) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('community_subscriptions').findOneAndDelete({ 
        userId: userId, 
        communityId: communityId 
      });
      if (result) {
        return {
          ...result,
          id: result._id.toString()
        };
      }
      return null;
    } else {
      const idx = mockSubscriptions.findIndex(sub => 
        sub.userId === userId && sub.communityId === communityId
      );
      if (idx === -1) return null;
      const [deleted] = mockSubscriptions.splice(idx, 1);
      return deleted;
    }
  }
};

module.exports = CommunitySubscriptionModel;