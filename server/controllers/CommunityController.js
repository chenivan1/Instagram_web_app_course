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

      // Auto-subscribe the manager to their own community
      await CommunitySubscription.create({
        userId: currentUser.id,
        communityId: newCommunity.id,
        subscribedAt: new Date()
      });

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
  }
};

module.exports = CommunityController;