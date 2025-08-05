const Post = require('../models/Post');
const Community = require('../models/Community');
const CommunitySubscription = require('../models/CommunitySubscription');
const User = require('../models/User');
const SessionManager = require('../sessionManager');

const PostController = {
  // Create a new post
  async createPost(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, imageData, communityId } = req.body;

    // Validation
    if (!communityId) {
      return res.status(400).json({ error: 'Community selection is required' });
    }

    if (!imageData) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (title && (typeof title !== 'string' || title.length > 100)) {
      return res.status(400).json({ error: 'Title must not exceed 100 characters' });
    }

    // Validate base64 image data
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    try {
      // Check if community exists
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user can post to this community
      // User can post if they're subscribed OR if they're the community manager
      const isSubscribed = await CommunitySubscription.findByUserAndCommunity(
        currentUser.id, 
        communityId
      );
      const isManager = community.managerId === currentUser.id;

      if (!isSubscribed && !isManager) {
        return res.status(403).json({ error: 'You must be subscribed to post in this community' });
      }

      // Create post
      const postData = {
        title: title ? title.trim() : '',
        imageData: imageData,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorProfilePicture: currentUser.profilePicture || null,
        communityId: communityId,
        communityName: community.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newPost = await Post.create(postData);

      res.status(201).json({
        message: 'Post created successfully',
        post: newPost,
        success: true
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get home feed (posts from subscribed communities + user's own posts)
  async getHomeFeed(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { 'my-posts-only': myPostsOnly } = req.query;

    try {
      if (myPostsOnly === 'true') {
        // Return only user's own posts
        const posts = await Post.findByAuthor(currentUser.id);
        
        // Enhance posts with author profile picture (current user's profile picture)
        const enhancedPosts = posts.map(post => ({
          ...post,
          authorProfilePicture: currentUser.profilePicture || null
        }));
        
        return res.json(enhancedPosts);
      }

      // Get user's subscribed communities
      const subscriptions = await CommunitySubscription.getUserSubscriptions(currentUser.id);
      const communityIds = subscriptions.map(sub => sub.communityId);

      // Get posts from subscribed communities + user's own posts
      const posts = await Post.findFeedPosts(communityIds, currentUser.id);

      // Enhance posts with author profile pictures
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        try {
          const author = await User.findById(post.authorId);
          return {
            ...post,
            authorProfilePicture: author ? author.profilePicture : null
          };
        } catch (error) {
          console.error(`Error fetching author data for post ${post.id}:`, error);
          return {
            ...post,
            authorProfilePicture: null
          };
        }
      }));

      res.json(enhancedPosts);
    } catch (error) {
      console.error('Get home feed error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user's own posts
  async getUserPosts(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const posts = await Post.findByAuthor(currentUser.id);
      res.json(posts);
    } catch (error) {
      console.error('Get user posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get posts in a specific community
  async getCommunityPosts(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: communityId } = req.params;

    try {
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user can view posts from this community
      // User can view if they're subscribed OR if they're the community manager
      const isSubscribed = await CommunitySubscription.findByUserAndCommunity(
        currentUser.id, 
        communityId
      );
      const isManager = community.managerId === currentUser.id;

      if (!isSubscribed && !isManager) {
        return res.status(403).json({ error: 'You must be subscribed to view posts from this community' });
      }

      const posts = await Post.findByCommunity(communityId);
      res.json(posts);
    } catch (error) {
      console.error('Get community posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update post (only title, only by author)
  async updatePost(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { title } = req.body;

    try {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if current user is the author
      if (post.authorId !== currentUser.id) {
        return res.status(403).json({ error: 'Only post author can update post' });
      }

      // Validation
      if (title !== undefined && title && (typeof title !== 'string' || title.length > 100)) {
        return res.status(400).json({ error: 'Title must not exceed 100 characters' });
      }

      const updateData = {
        title: title !== undefined ? (title ? title.trim() : '') : post.title
      };

      const updatedPost = await Post.update(id, updateData);
      
      res.json({
        message: 'Post updated successfully',
        post: updatedPost,
        success: true
      });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete post (only by author)
  async deletePost(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    try {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if current user is the author
      if (post.authorId !== currentUser.id) {
        return res.status(403).json({ error: 'Only post author can delete post' });
      }

      await Post.delete(id);
      
      res.json({
        message: 'Post deleted successfully',
        success: true
      });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get specific post by ID
  async getPostById(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    try {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user can view this post
      // User can view if they're subscribed to the community, or if they're the author, or if they're the community manager
      const isAuthor = post.authorId === currentUser.id;
      
      if (isAuthor) {
        return res.json(post);
      }

      const community = await Community.findById(post.communityId);
      const isManager = community && community.managerId === currentUser.id;
      
      if (isManager) {
        return res.json(post);
      }

      const isSubscribed = await CommunitySubscription.findByUserAndCommunity(
        currentUser.id, 
        post.communityId
      );

      if (!isSubscribed) {
        return res.status(403).json({ error: 'You do not have access to view this post' });
      }

      res.json(post);
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = PostController;