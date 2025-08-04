const { ObjectId } = require('mongodb');
const connectDB = require('../db');

const useDb = false; // Following existing pattern

let mockSubscriptions = [];

const CommunitySubscriptionModel = {
  async find(query = {}) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('community_subscriptions').find(query).toArray();
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
      return db.collection('community_subscriptions').findOne({ 
        userId: userId, 
        communityId: communityId 
      });
    } else {
      return mockSubscriptions.find(sub => 
        sub.userId === userId && sub.communityId === communityId
      );
    }
  },
  
  async getUserSubscriptions(userId) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('community_subscriptions').find({ userId: userId }).toArray();
    } else {
      return mockSubscriptions.filter(sub => sub.userId === userId);
    }
  },
  
  async getCommunitySubscribers(communityId) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('community_subscriptions').find({ communityId: communityId }).toArray();
    } else {
      return mockSubscriptions.filter(sub => sub.communityId === communityId);
    }
  },
  
  async create(data) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('community_subscriptions').insertOne(data);
      return { _id: result.insertedId, ...data };
    } else {
      const subscription = { 
        id: String(Date.now()), 
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
      return result.value;
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