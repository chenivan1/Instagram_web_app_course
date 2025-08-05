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

  // Advanced post search
  async searchPosts(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { 
      community, 
      authorName, 
      dateFrom, 
      dateTo, 
      minLikes, 
      hasComments 
    } = req.query;

    try {
      // Get user's subscribed communities to limit search scope
      const subscriptions = await CommunitySubscription.getUserSubscriptions(currentUser.id);
      const subscribedCommunityIds = subscriptions.map(sub => sub.communityId);

      // Get all posts from subscribed communities + user's own posts
      const allPosts = await Post.findFeedPosts(subscribedCommunityIds, currentUser.id);

      // Apply filters
      let filteredPosts = allPosts;

      // Filter by community
      if (community && community.trim()) {
        filteredPosts = filteredPosts.filter(post => 
          post.communityName.toLowerCase().includes(community.toLowerCase()) ||
          post.communityId === community
        );
      }

      // Filter by author name
      if (authorName && authorName.trim()) {
        filteredPosts = filteredPosts.filter(post => 
          post.authorName.toLowerCase().includes(authorName.toLowerCase())
        );
      }

      // Filter by date range
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredPosts = filteredPosts.filter(post => 
          new Date(post.createdAt) >= fromDate
        );
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        filteredPosts = filteredPosts.filter(post => 
          new Date(post.createdAt) <= toDate
        );
      }

      // Filter by minimum likes
      if (minLikes && !isNaN(parseInt(minLikes))) {
        const minLikesNum = parseInt(minLikes);
        filteredPosts = filteredPosts.filter(post => 
          (post.likesCount || 0) >= minLikesNum
        );
      }

      // Filter by has comments
      if (hasComments !== undefined) {
        const shouldHaveComments = hasComments === 'true';
        filteredPosts = filteredPosts.filter(post => {
          const hasPostComments = post.comments && post.comments.length > 0;
          return shouldHaveComments ? hasPostComments : !hasPostComments;
        });
      }

      // Enhance posts with author profile pictures
      const enhancedPosts = await Promise.all(filteredPosts.map(async (post) => {
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
      console.error('Search posts error:', error);
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
  },

  // Toggle like on a post
  async toggleLike(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    try {
      // Check if post exists and user has access to it
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user can view this post (same logic as getPostById)
      const isAuthor = post.authorId === currentUser.id;
      let hasAccess = isAuthor;

      if (!hasAccess) {
        const community = await Community.findById(post.communityId);
        const isManager = community && community.managerId === currentUser.id;
        
        if (isManager) {
          hasAccess = true;
        } else {
          const isSubscribed = await CommunitySubscription.findByUserAndCommunity(
            currentUser.id, 
            post.communityId
          );
          hasAccess = !!isSubscribed;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this post' });
      }

      // Toggle like
      const updatedPost = await Post.toggleLike(id, currentUser.id);
      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user liked or unliked
      const isLiked = updatedPost.likes && updatedPost.likes.includes(currentUser.id);

      res.json({
        success: true,
        isLiked: isLiked,
        likesCount: updatedPost.likesCount || 0,
        message: isLiked ? 'Post liked' : 'Post unliked'
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Add comment to a post
  async addComment(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { text } = req.body;

    // Validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    if (text.trim().length > 500) {
      return res.status(400).json({ error: 'Comment must not exceed 500 characters' });
    }

    try {
      // Check if post exists and user has access to it
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user can view this post (same logic as getPostById)
      const isAuthor = post.authorId === currentUser.id;
      let hasAccess = isAuthor;

      if (!hasAccess) {
        const community = await Community.findById(post.communityId);
        const isManager = community && community.managerId === currentUser.id;
        
        if (isManager) {
          hasAccess = true;
        } else {
          const isSubscribed = await CommunitySubscription.findByUserAndCommunity(
            currentUser.id, 
            post.communityId
          );
          hasAccess = !!isSubscribed;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this post' });
      }

      // Add comment
      const commentData = {
        text: text.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorProfilePicture: currentUser.profilePicture || null
      };

      const updatedPost = await Post.addComment(id, commentData);
      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Return the new comment
      const newComment = updatedPost.comments[updatedPost.comments.length - 1];

      res.status(201).json({
        success: true,
        comment: newComment,
        message: 'Comment added successfully'
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get comments for a post
  async getComments(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    try {
      // Check if post exists and user has access to it
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user can view this post (same logic as getPostById)
      const isAuthor = post.authorId === currentUser.id;
      let hasAccess = isAuthor;

      if (!hasAccess) {
        const community = await Community.findById(post.communityId);
        const isManager = community && community.managerId === currentUser.id;
        
        if (isManager) {
          hasAccess = true;
        } else {
          const isSubscribed = await CommunitySubscription.findByUserAndCommunity(
            currentUser.id, 
            post.communityId
          );
          hasAccess = !!isSubscribed;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this post' });
      }

      // Get comments sorted by date (newest first)
      const comments = await Post.getComments(id);
      const sortedComments = comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        success: true,
        comments: sortedComments
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update comment (only by comment author)
  async updateComment(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { postId, commentId } = req.params;
    const { text } = req.body;

    // Validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    if (text.trim().length > 500) {
      return res.status(400).json({ error: 'Comment must not exceed 500 characters' });
    }

    try {
      // Check if post exists and user has access to it
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user can view this post (same logic as getPostById)
      const isAuthor = post.authorId === currentUser.id;
      let hasAccess = isAuthor;

      if (!hasAccess) {
        const community = await Community.findById(post.communityId);
        const isManager = community && community.managerId === currentUser.id;
        
        if (isManager) {
          hasAccess = true;
        } else {
          const isSubscribed = await CommunitySubscription.findByUserAndCommunity(
            currentUser.id, 
            post.communityId
          );
          hasAccess = !!isSubscribed;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this post' });
      }

      // Find the comment and check if current user is the author
      const comment = await Post.findComment(postId, commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.authorId !== currentUser.id) {
        return res.status(403).json({ error: 'Only comment author can update comment' });
      }

      // Update comment
      const updatedPost = await Post.updateComment(postId, commentId, text.trim());
      if (!updatedPost) {
        return res.status(404).json({ error: 'Failed to update comment' });
      }

      // Find the updated comment
      const updatedComment = updatedPost.comments.find(c => c.id === commentId);

      res.json({
        success: true,
        comment: updatedComment,
        message: 'Comment updated successfully'
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete comment (only by comment author)
  async deleteComment(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { postId, commentId } = req.params;

    try {
      // Check if post exists and user has access to it
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user can view this post (same logic as getPostById)
      const isAuthor = post.authorId === currentUser.id;
      let hasAccess = isAuthor;

      if (!hasAccess) {
        const community = await Community.findById(post.communityId);
        const isManager = community && community.managerId === currentUser.id;
        
        if (isManager) {
          hasAccess = true;
        } else {
          const isSubscribed = await CommunitySubscription.findByUserAndCommunity(
            currentUser.id, 
            post.communityId
          );
          hasAccess = !!isSubscribed;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this post' });
      }

      // Find the comment and check if current user is the author
      const comment = await Post.findComment(postId, commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.authorId !== currentUser.id) {
        return res.status(403).json({ error: 'Only comment author can delete comment' });
      }

      // Delete comment
      const updatedPost = await Post.deleteComment(postId, commentId);
      if (!updatedPost) {
        return res.status(404).json({ error: 'Failed to delete comment' });
      }

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = PostController;