const Community = require('../models/Community');
const CommunitySubscription = require('../models/CommunitySubscription');
const SessionManager = require('../sessionManager');
const path = require('path');

const CommunityController = {
  // Get all communities (for browsing/discovery)
  async getAllCommunities(req, res) {
    try {
      const communities = await Community.find();
      res.json(communities);
    } catch (error) {
      console.error('Get communities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get specific community by ID
  async getCommunityById(req, res) {
    try {
      const community = await Community.findById(req.params.id);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      res.json(community);
    } catch (error) {
      console.error('Get community error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new community
  async createCommunity(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name, description } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 50) {
      return res.status(400).json({ error: 'Community name must be between 3-50 characters' });
    }

    if (description && (typeof description !== 'string' || description.length > 200)) {
      return res.status(400).json({ error: 'Description must not exceed 200 characters' });
    }

    try {
      // Check if community name already exists (case-insensitive)
      const existingCommunity = await Community.findByName(name.trim());
      if (existingCommunity) {
        return res.status(409).json({ error: 'Community with this name already exists' });
      }

      // Create community
      const communityData = {
        name: name.trim(),
        description: description ? description.trim() : '',
        managerId: currentUser.id,
        managerName: currentUser.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newCommunity = await Community.create(communityData);
      console.log('Created new community:', {id: newCommunity.id, name: newCommunity.name});

      // Auto-subscribe the manager to their own community
      const subscription = await CommunitySubscription.create({
        userId: currentUser.id,
        communityId: newCommunity.id,
        subscribedAt: new Date()
      });
      console.log('Created subscription:', {id: subscription.id, userId: subscription.userId, communityId: subscription.communityId});

      res.status(201).json({
        message: 'Community created successfully',
        community: newCommunity,
        success: true
      });
    } catch (error) {
      console.error('Create community error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update community (only by manager)
  async updateCommunity(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    try {
      const community = await Community.findById(id);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if current user is the manager
      if (community.managerId !== currentUser.id) {
        return res.status(403).json({ error: 'Only community manager can update community' });
      }

      // Validation
      const updateData = {};
      
      if (name !== undefined) {
        if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 50) {
          return res.status(400).json({ error: 'Community name must be between 3-50 characters' });
        }
        
        // Check if new name conflicts with existing community (excluding current one)
        const existingCommunity = await Community.findByName(name.trim());
        if (existingCommunity && existingCommunity.id !== id) {
          return res.status(409).json({ error: 'Community with this name already exists' });
        }
        
        updateData.name = name.trim();
      }

      if (description !== undefined) {
        if (description && (typeof description !== 'string' || description.length > 200)) {
          return res.status(400).json({ error: 'Description must not exceed 200 characters' });
        }
        updateData.description = description ? description.trim() : '';
      }

      const updatedCommunity = await Community.update(id, updateData);
      
      res.json({
        message: 'Community updated successfully',
        community: updatedCommunity,
        success: true
      });
    } catch (error) {
      console.error('Update community error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get communities managed by current user
  async getManagedCommunities(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const communities = await Community.find();
      const managedCommunities = communities.filter(c => c.managerId === currentUser.id);
      res.json(managedCommunities);
    } catch (error) {
      console.error('Get managed communities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get community subscribers (manager only)
  async getCommunitySubscribers(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    try {
      const community = await Community.findById(id);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if current user is the manager
      if (community.managerId !== currentUser.id) {
        return res.status(403).json({ error: 'Only community manager can view subscribers' });
      }

      const subscriptions = await CommunitySubscription.getCommunitySubscribers(id);
      res.json(subscriptions);
    } catch (error) {
      console.error('Get community subscribers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Render community statistics page
  async renderStatisticsPage(req, res) {
    try {
      res.sendFile(path.join(__dirname, '../views/communities/statistics.html'));
    } catch (error) {
      console.error('Render statistics page error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get post activity statistics for managed communities
  async getPostActivityStats(req, res) {
    try {
      const currentUser = SessionManager.getLoggedInUser();
      if (!currentUser) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const Post = require('../models/Post');

      // Get user's managed communities
      const managedCommunities = await Community.find();
      const userManagedCommunities = managedCommunities.filter(c => c.managerId === currentUser.id);

      if (userManagedCommunities.length === 0) {
        return res.json([]);
      }

      const communityIds = userManagedCommunities.map(c => c.id);

      // Use model aggregation method
      const aggregationResult = await Post.getPostActivityStats(communityIds);
      
      // Process aggregation result
      const activityStats = userManagedCommunities.map(community => {
        const stats = aggregationResult.find(item => item._id === community.id) || {
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0
        };
        
        return {
          communityId: community.id,
          communityName: community.name,
          totalPosts: stats.totalPosts,
          totalLikes: stats.totalLikes,
          totalComments: stats.totalComments,
          avgLikesPerPost: stats.totalPosts > 0 ? (stats.totalLikes / stats.totalPosts).toFixed(1) : 0,
          avgCommentsPerPost: stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(1) : 0
        };
      });

      res.json(activityStats);
    } catch (error) {
      console.error('Get post activity stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = CommunityController;