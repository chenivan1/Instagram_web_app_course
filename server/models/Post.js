const connectDB = require('../db');
const { ObjectId } = require('mongodb');

const useDb = process.env.USE_DB === 'true';

let mockPosts = [
  {
    id: '1',
    title: 'Latest AI Breakthrough',
    imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    authorId: '1',
    authorName: 'John Doe',
    authorProfilePicture: null,
    communityId: '1',
    communityName: 'Tech Enthusiasts',
    likes: ['2', '3'],
    likesCount: 2,
    comments: [
      {
        id: '1',
        text: 'This is fascinating! Thanks for sharing.',
        authorId: '2',
        authorName: 'Jane Doe',
        authorProfilePicture: null,
        createdAt: new Date('2024-01-15T10:30:00Z')
      }
    ],
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T09:00:00Z')
  },
  {
    id: '2',
    title: 'Sunset Photography Tips',
    imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    authorId: '2',
    authorName: 'Jane Doe',
    authorProfilePicture: null,
    communityId: '2',
    communityName: 'Photography Club',
    likes: ['1'],
    likesCount: 1,
    comments: [],
    createdAt: new Date('2024-01-14T18:00:00Z'),
    updatedAt: new Date('2024-01-14T18:00:00Z')
  },
  {
    id: '3',
    title: 'Homemade Pizza Recipe',
    imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    authorId: '3',
    authorName: 'Admin User',
    authorProfilePicture: null,
    communityId: '3',
    communityName: 'Food & Recipes',
    likes: ['1', '2'],
    likesCount: 2,
    comments: [
      {
        id: '2',
        text: 'Looks delicious! What type of flour did you use?',
        authorId: '1',
        authorName: 'John Doe',
        authorProfilePicture: null,
        createdAt: new Date('2024-01-13T15:45:00Z')
      },
      {
        id: '3',
        text: 'I used 00 flour for the best texture!',
        authorId: '3',
        authorName: 'Admin User',
        authorProfilePicture: null,
        createdAt: new Date('2024-01-13T16:00:00Z')
      }
    ],
    createdAt: new Date('2024-01-13T14:30:00Z'),
    updatedAt: new Date('2024-01-13T14:30:00Z')
  },
  {
    id: '4',
    title: 'Hidden Gems in Tokyo',
    imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    authorId: '1',
    authorName: 'John Doe',
    authorProfilePicture: null,
    communityId: '4',
    communityName: 'Travel Adventures',
    likes: ['2', '3'],
    likesCount: 2,
    comments: [],
    createdAt: new Date('2024-01-12T12:00:00Z'),
    updatedAt: new Date('2024-01-12T12:00:00Z')
  },
  {
    id: '5',
    title: 'Morning Workout Routine',
    imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    authorId: '2',
    authorName: 'Jane Doe',
    authorProfilePicture: null,
    communityId: '5',
    communityName: 'Fitness & Health',
    likes: ['3'],
    likesCount: 1,
    comments: [
      {
        id: '4',
        text: 'Great routine! How long does it take?',
        authorId: '3',
        authorName: 'Admin User',
        authorProfilePicture: null,
        createdAt: new Date('2024-01-11T07:15:00Z')
      }
    ],
    createdAt: new Date('2024-01-11T06:30:00Z'),
    updatedAt: new Date('2024-01-11T06:30:00Z')
  },
  {
    id: '6',
    title: 'New JavaScript Framework Review',
    imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    authorId: '3',
    authorName: 'Admin User',
    authorProfilePicture: null,
    communityId: '1',
    communityName: 'Tech Enthusiasts',
    likes: ['1'],
    likesCount: 1,
    comments: [],
    createdAt: new Date('2024-01-10T16:45:00Z'),
    updatedAt: new Date('2024-01-10T16:45:00Z')
  },
  {
    id: '7',
    title: 'Street Photography Challenge',
    imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    authorId: '1',
    authorName: 'John Doe',
    authorProfilePicture: null,
    communityId: '2',
    communityName: 'Photography Club',
    likes: ['2'],
    likesCount: 1,
    comments: [],
    createdAt: new Date('2024-01-09T11:20:00Z'),
    updatedAt: new Date('2024-01-09T11:20:00Z')
  },
  {
    id: '8',
    title: 'Healthy Smoothie Bowl',
    imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    authorId: '2',
    authorName: 'Jane Doe',
    authorProfilePicture: null,
    communityId: '3',
    communityName: 'Food & Recipes',
    likes: ['1', '3'],
    likesCount: 2,
    comments: [
      {
        id: '5',
        text: 'What fruits did you use? Looks amazing!',
        authorId: '1',
        authorName: 'John Doe',
        authorProfilePicture: null,
        createdAt: new Date('2024-01-08T09:30:00Z')
      }
    ],
    createdAt: new Date('2024-01-08T08:00:00Z'),
    updatedAt: new Date('2024-01-08T08:00:00Z')
  }
];

const PostModel = {
  async find(query = {}) {
    if (useDb) {
      const db = await connectDB();
      const posts = await db.collection('posts').find(query).sort({ createdAt: -1 }).toArray();
      return posts.map(post => ({
        ...post,
        id: post._id.toString()
      }));
    } else {
      let posts = mockPosts.map(post => ({
        ...post,
        likes: post.likes || [],
        likesCount: post.likesCount || 0,
        comments: post.comments || []
      }));
      
      // Handle simple queries
      if (Object.keys(query).length > 0) {
        posts = posts.filter(post => {
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
      
      // Convert id to string if it's an ObjectId
      const searchId = id.toString();
      
      // Try to find by id field first (our preferred method)
      let post = await db.collection('posts').findOne({ id: searchId });
      
      // If not found by id field, try by _id field (for backward compatibility)
      if (!post) {
        try {
          // Check if the searchId is a valid ObjectId format
          if (ObjectId.isValid(searchId)) {
            post = await db.collection('posts').findOne({ _id: new ObjectId(searchId) });
          }
        } catch (error) {
          // Ignore ObjectId creation errors
        }
      }
      
      if (post) {
        return {
          ...post,
          id: post._id.toString()
        };
      }
      return null;
    } else {
      const post = mockPosts.find(p => p.id === id);
      if (post) {
        return {
          ...post,
          likes: post.likes || [],
          likesCount: post.likesCount || 0,
          comments: post.comments || []
        };
      }
      return null;
    }
  },
  
  async findByAuthor(authorId) {
    if (useDb) {
      const db = await connectDB();
      const posts = await db.collection('posts').find({ authorId: authorId }).sort({ createdAt: -1 }).toArray();
      return posts.map(post => ({
        ...post,
        id: post._id.toString()
      }));
    } else {
      return mockPosts
        .filter(p => p.authorId === authorId)
        .map(post => ({
          ...post,
          likes: post.likes || [],
          likesCount: post.likesCount || 0,
          comments: post.comments || []
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  
  async findByCommunity(communityId) {
    if (useDb) {
      const db = await connectDB();
      const posts = await db.collection('posts').find({ communityId: communityId }).sort({ createdAt: -1 }).toArray();
      return posts.map(post => ({
        ...post,
        id: post._id.toString()
      }));
    } else {
      return mockPosts
        .filter(p => p.communityId === communityId)
        .map(post => ({
          ...post,
          likes: post.likes || [],
          likesCount: post.likesCount || 0,
          comments: post.comments || []
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  
  async findFeedPosts(communityIds, authorId) {
    if (useDb) {
      const db = await connectDB();
      // Find posts from subscribed communities OR posts by the user
      const posts = await db.collection('posts').find({
        $or: [
          { communityId: { $in: communityIds } },
          { authorId: authorId }
        ]
      }).sort({ createdAt: -1 }).toArray();
      return posts.map(post => ({
        ...post,
        id: post._id.toString()
      }));
    } else {
      return mockPosts
        .filter(p => communityIds.includes(p.communityId) || p.authorId === authorId)
        .map(post => ({
          ...post,
          likes: post.likes || [],
          likesCount: post.likesCount || 0,
          comments: post.comments || []
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  
  async create(data) {
    if (useDb) {
      const db = await connectDB();
      const postData = {
        ...data,
        likes: [],
        likesCount: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('posts').insertOne(postData);
      return { 
        _id: result.insertedId, 
        ...postData,
        id: result.insertedId.toString()
      };
    } else {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const post = { 
        id: `${timestamp}-${random}`, 
        ...data,
        likes: [],
        likesCount: 0,
        comments: [],
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
        { id: id },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      if (result) {
        return {
          ...result,
          id: result._id.toString()
        };
      }
      return null;
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
      let result;
      
      // Try to delete by _id first (for MongoDB ObjectId)
      try {
        if (ObjectId.isValid(id)) {
          result = await db.collection('posts').findOneAndDelete({ _id: new ObjectId(id) });
        }
      } catch (error) {
        // If ObjectId conversion fails, try as string
      }
      
      // If not deleted by _id, try by custom id field
      if (!result) {
        result = await db.collection('posts').findOneAndDelete({ id: id });
      }
      
      if (result) {
        return {
          ...result,
          id: result._id.toString()
        };
      }
      return null;
    } else {
      const idx = mockPosts.findIndex(p => p.id === id);
      if (idx === -1) return null;
      const [deleted] = mockPosts.splice(idx, 1);
      return deleted;
    }
  },

  // Like/Unlike post
  async toggleLike(postId, userId) {
    if (useDb) {
      const db = await connectDB();
      
      // Use findById method to ensure consistent post finding logic
      const post = await this.findById(postId);
      if (!post) return null;

      const likes = post.likes || [];
      const userIndex = likes.indexOf(userId);
      
      if (userIndex > -1) {
        // Unlike - remove user from likes
        likes.splice(userIndex, 1);
      } else {
        // Like - add user to likes
        likes.push(userId);
      }

      // Update using the appropriate field (_id or custom id)
      let result;
      
      // Try to update by _id first (for MongoDB ObjectId)
      try {
        if (ObjectId.isValid(postId)) {
          result = await db.collection('posts').findOneAndUpdate(
            { _id: new ObjectId(postId) },
            { 
              $set: { 
                likes: likes,
                likesCount: likes.length,
                updatedAt: new Date() 
              } 
            },
            { returnDocument: 'after' }
          );
        }
      } catch (error) {
        // If ObjectId conversion fails, continue to try custom id
      }
      
      // If not updated by _id, try by custom id field
      if (!result) {
        result = await db.collection('posts').findOneAndUpdate(
          { id: postId },
          { 
            $set: { 
              likes: likes,
              likesCount: likes.length,
              updatedAt: new Date() 
            } 
          },
          { returnDocument: 'after' }
        );
      }
      if (result) {
        return {
          ...result,
          id: result._id.toString()
        };
      }
      return null;
    } else {
      const post = mockPosts.find(p => p.id === postId);
      if (!post) return null;

      if (!post.likes) post.likes = [];
      const userIndex = post.likes.indexOf(userId);
      
      if (userIndex > -1) {
        // Unlike - remove user from likes
        post.likes.splice(userIndex, 1);
      } else {
        // Like - add user to likes
        post.likes.push(userId);
      }

      post.likesCount = post.likes.length;
      post.updatedAt = new Date();
      return post;
    }
  },

  // Add comment to post
  async addComment(postId, commentData) {
    if (useDb) {
      const db = await connectDB();
      
      // Use findById method to ensure the post exists first
      const post = await this.findById(postId);
      if (!post) return null;
      
      const comment = {
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...commentData,
        createdAt: new Date()
      };

      // Update using the appropriate field (_id or custom id)
      let result;
      
      // Try to update by _id first (for MongoDB ObjectId)
      try {
        if (ObjectId.isValid(postId)) {
          result = await db.collection('posts').findOneAndUpdate(
            { _id: new ObjectId(postId) },
            { 
              $push: { comments: comment },
              $set: { updatedAt: new Date() }
            },
            { returnDocument: 'after' }
          );
        }
      } catch (error) {
        // If ObjectId conversion fails, continue to try custom id
      }
      
      // If not updated by _id, try by custom id field
      if (!result) {
        result = await db.collection('posts').findOneAndUpdate(
          { id: postId },
          { 
            $push: { comments: comment },
            $set: { updatedAt: new Date() }
          },
          { returnDocument: 'after' }
        );
      }
      if (result) {
        return {
          ...result,
          id: result._id.toString()
        };
      }
      return null;
    } else {
      const post = mockPosts.find(p => p.id === postId);
      if (!post) return null;

      if (!post.comments) post.comments = [];
      const comment = {
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...commentData,
        createdAt: new Date()
      };

      post.comments.push(comment);
      post.updatedAt = new Date();
      return post;
    }
  },

  // Get comments for a post
  async getComments(postId) {
    if (useDb) {
      const db = await connectDB();
      let post;
      
      // Try to find by _id first (for MongoDB ObjectId)
      try {
        if (ObjectId.isValid(postId)) {
          post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
        }
      } catch (error) {
        // If ObjectId conversion fails, try as string
      }
      
      // If not found by _id, try by custom id field
      if (!post) {
        post = await db.collection('posts').findOne({ id: postId });
      }
      
      return post ? (post.comments || []) : [];
    } else {
      const post = mockPosts.find(p => p.id === postId);
      return post ? (post.comments || []) : [];
    }
  },

  // Update comment in post
  async updateComment(postId, commentId, newText) {
    if (useDb) {
      const db = await connectDB();
      let result;
      
      // Try to update by _id first (for MongoDB ObjectId)
      try {
        if (ObjectId.isValid(postId)) {
          result = await db.collection('posts').findOneAndUpdate(
            { 
              _id: new ObjectId(postId),
              'comments.id': commentId
            },
            { 
              $set: { 
                'comments.$.text': newText,
                'comments.$.updatedAt': new Date(),
                updatedAt: new Date()
              }
            },
            { returnDocument: 'after' }
          );
        }
      } catch (error) {
        // If ObjectId conversion fails, continue to try custom id
      }
      
      // If not updated by _id, try by custom id field
      if (!result) {
        result = await db.collection('posts').findOneAndUpdate(
          { 
            id: postId,
            'comments.id': commentId
          },
          { 
            $set: { 
              'comments.$.text': newText,
              'comments.$.updatedAt': new Date(),
              updatedAt: new Date()
            }
          },
          { returnDocument: 'after' }
        );
      }
      
      if (result) {
        return {
          ...result,
          id: result._id.toString()
        };
      }
      return null;
    } else {
      const post = mockPosts.find(p => p.id === postId);
      if (!post) return null;

      const comment = post.comments?.find(c => c.id === commentId);
      if (!comment) return null;

      comment.text = newText;
      comment.updatedAt = new Date();
      post.updatedAt = new Date();
      return post;
    }
  },

  // Delete comment from post
  async deleteComment(postId, commentId) {
    if (useDb) {
      const db = await connectDB();
      let result;
      
      // Try to update by _id first (for MongoDB ObjectId)
      try {
        if (ObjectId.isValid(postId)) {
          result = await db.collection('posts').findOneAndUpdate(
            { _id: new ObjectId(postId) },
            { 
              $pull: { comments: { id: commentId } },
              $set: { updatedAt: new Date() }
            },
            { returnDocument: 'after' }
          );
        }
      } catch (error) {
        // If ObjectId conversion fails, continue to try custom id
      }
      
      // If not updated by _id, try by custom id field
      if (!result) {
        result = await db.collection('posts').findOneAndUpdate(
          { id: postId },
          { 
            $pull: { comments: { id: commentId } },
            $set: { updatedAt: new Date() }
          },
          { returnDocument: 'after' }
        );
      }
      
      if (result) {
        return {
          ...result,
          id: result._id.toString()
        };
      }
      return null;
    } else {
      const post = mockPosts.find(p => p.id === postId);
      if (!post) return null;

      if (!post.comments) return post;
      
      const commentIndex = post.comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return null;

      post.comments.splice(commentIndex, 1);
      post.updatedAt = new Date();
      return post;
    }
  },

  // Find comment by ID in a post
  async findComment(postId, commentId) {
    if (useDb) {
      const db = await connectDB();
      let post;
      
      // Try to find by _id first (for MongoDB ObjectId)
      try {
        if (ObjectId.isValid(postId)) {
          post = await db.collection('posts').findOne({ 
            _id: new ObjectId(postId),
            'comments.id': commentId
          });
        }
      } catch (error) {
        // If ObjectId conversion fails, try as string
      }
      
      // If not found by _id, try by custom id field
      if (!post) {
        post = await db.collection('posts').findOne({ 
          id: postId,
          'comments.id': commentId
        });
      }
      
      if (!post) return null;
      return post.comments?.find(c => c.id === commentId) || null;
    } else {
      const post = mockPosts.find(p => p.id === postId);
      if (!post) return null;
      return post.comments?.find(c => c.id === commentId) || null;
    }
  },

  // Get post activity statistics aggregated by community
  async getPostActivityStats(communityIds) {
    if (useDb) {
      const db = await connectDB();
      const pipeline = [
        {
          $match: {
            communityId: { $in: communityIds }
          }
        },
        {
          $group: {
            _id: '$communityId',
            totalPosts: { $sum: 1 },
            totalLikes: { $sum: '$likesCount' },
            totalComments: { 
              $sum: { 
                $cond: { 
                  if: { $isArray: '$comments' }, 
                  then: { $size: '$comments' }, 
                  else: 0 
                } 
              } 
            }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ];

      return await db.collection('posts').aggregate(pipeline).toArray();
    } else {
      // Mock data aggregation (simulating $group behavior)
      const relevantPosts = mockPosts.filter(post => 
        communityIds.includes(post.communityId)
      );

      // Simulate MongoDB $group operation
      const groupedData = {};
      
      relevantPosts.forEach(post => {
        if (!groupedData[post.communityId]) {
          groupedData[post.communityId] = {
            _id: post.communityId,
            totalPosts: 0,
            totalLikes: 0,
            totalComments: 0
          };
        }
        
        groupedData[post.communityId].totalPosts++;
        groupedData[post.communityId].totalLikes += (post.likesCount || 0);
        groupedData[post.communityId].totalComments += (post.comments?.length || 0);
      });

      // Convert grouped data to array format similar to MongoDB aggregation
      return Object.values(groupedData).sort((a, b) => a._id.localeCompare(b._id));
    }
  }
};

module.exports = PostModel;