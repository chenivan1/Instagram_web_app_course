const { ObjectId } = require('mongodb');
const connectDB = require('../db');

const useDb = false; // Following existing pattern

let mockPosts = [];

const PostModel = {
  async find(query = {}) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('posts').find(query).sort({ createdAt: -1 }).toArray();
    } else {
      let posts = mockPosts;
      
      // Handle simple queries
      if (Object.keys(query).length > 0) {
        posts = mockPosts.filter(post => {
          return Object.entries(query).every(([key, value]) => {
            if (Array.isArray(value)) {
              // Handle $in queries (for multiple community IDs)
              return value.includes(post[key]);
            }
            return post[key] === value;
          });
        });
      }
      
      // Sort by creation date (newest first)
      return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  
  async findById(id) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('posts').findOne({ _id: new ObjectId(id) });
    } else {
      return mockPosts.find(p => p.id === id);
    }
  },
  
  async findByAuthor(authorId) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('posts').find({ authorId: authorId }).sort({ createdAt: -1 }).toArray();
    } else {
      return mockPosts
        .filter(p => p.authorId === authorId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  
  async findByCommunity(communityId) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('posts').find({ communityId: communityId }).sort({ createdAt: -1 }).toArray();
    } else {
      return mockPosts
        .filter(p => p.communityId === communityId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  
  async findFeedPosts(communityIds, authorId) {
    if (useDb) {
      const db = await connectDB();
      // Find posts from subscribed communities OR posts by the user
      return db.collection('posts').find({
        $or: [
          { communityId: { $in: communityIds } },
          { authorId: authorId }
        ]
      }).sort({ createdAt: -1 }).toArray();
    } else {
      return mockPosts
        .filter(p => communityIds.includes(p.communityId) || p.authorId === authorId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  
  async create(data) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('posts').insertOne(data);
      return { _id: result.insertedId, ...data };
    } else {
      const post = { 
        id: String(Date.now()), 
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockPosts.push(post);
      return post;
    }
  },
  
  async update(id, data) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('posts').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result.value;
    } else {
      const idx = mockPosts.findIndex(p => p.id === id);
      if (idx === -1) return null;
      mockPosts[idx] = { 
        ...mockPosts[idx], 
        ...data, 
        updatedAt: new Date() 
      };
      return mockPosts[idx];
    }
  },
  
  async delete(id) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('posts').findOneAndDelete({ _id: new ObjectId(id) });
      return result.value;
    } else {
      const idx = mockPosts.findIndex(p => p.id === id);
      if (idx === -1) return null;
      const [deleted] = mockPosts.splice(idx, 1);
      return deleted;
    }
  }
};

module.exports = PostModel;