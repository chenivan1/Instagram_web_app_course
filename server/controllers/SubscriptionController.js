const CommunitySubscription = require('../models/CommunitySubscription');
const Community = require('../models/Community');
const SessionManager = require('../sessionManager');

const SubscriptionController = {
  // Subscribe to a community
  async subscribeToCommunity(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: communityId } = req.params;

    try {
      // Check if community exists
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if already subscribed
      const existingSubscription = await CommunitySubscription.findByUserAndCommunity(
        currentUser.id, 
        communityId
      );

      if (existingSubscription) {
        return res.status(409).json({ error: 'Already subscribed to this community' });
      }

      // Create subscription
      const subscription = await CommunitySubscription.create({
        userId: currentUser.id,
        communityId: communityId,
        subscribedAt: new Date()
      });

      res.status(201).json({
        message: 'Successfully subscribed to community',
        subscription: subscription,
        success: true
      });
    } catch (error) {
      console.error('Subscribe to community error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Unsubscribe from a community
  async unsubscribeFromCommunity(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: communityId } = req.params;

    try {
      // Check if subscribed
      const subscription = await CommunitySubscription.findByUserAndCommunity(
        currentUser.id, 
        communityId
      );

      if (!subscription) {
        return res.status(404).json({ error: 'Not subscribed to this community' });
      }

      // Delete subscription
      await CommunitySubscription.deleteByUserAndCommunity(currentUser.id, communityId);

      res.json({
        message: 'Successfully unsubscribed from community',
        success: true
      });
    } catch (error) {
      console.error('Unsubscribe from community error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user's subscribed communities
  async getUserSubscriptions(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const subscriptions = await CommunitySubscription.getUserSubscriptions(currentUser.id);
      console.log(`Found ${subscriptions.length} subscriptions for user ${currentUser.id}:`, subscriptions.map(s => ({id: s.id, communityId: s.communityId})));
      
      // Get full community details for each subscription
      const communities = await Community.find();
      console.log(`Found ${communities.length} communities:`, communities.map(c => ({id: c.id, name: c.name})));
      
      const subscribedCommunities = await Promise.all(
        subscriptions.map(async sub => {
          let community = communities.find(c => c.id === sub.communityId);
          
          // If community not found in the bulk fetch, try to find it individually
          if (!community) {
            console.warn(`Community not found in bulk fetch for subscription: ${sub.communityId}, trying individual lookup`);
            community = await Community.findById(sub.communityId);
          }
          
          if (!community) {
            console.warn(`Community not found even with individual lookup: ${sub.communityId}`);
            return null;
          }
          
          console.log(`Mapping subscription ${sub.id} to community:`, {id: community.id, name: community.name});
          return {
            ...community,
            subscribedAt: sub.subscribedAt
          };
        })
      );
      
      // Filter out null entries
      const validSubscribedCommunities = subscribedCommunities.filter(Boolean);

      console.log(`Returning ${validSubscribedCommunities.length} subscribed communities:`, validSubscribedCommunities.map(c => ({id: c.id, name: c.name})));
      res.json(validSubscribedCommunities);
    } catch (error) {
      console.error('Get user subscriptions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Check if user is subscribed to a specific community
  async checkSubscriptionStatus(req, res) {
    const currentUser = SessionManager.getLoggedInUser();
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: communityId } = req.params;

    try {
      const subscription = await CommunitySubscription.findByUserAndCommunity(
        currentUser.id, 
        communityId
      );

      res.json({
        isSubscribed: !!subscription,
        subscription: subscription
      });
    } catch (error) {
      console.error('Check subscription status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = SubscriptionController;