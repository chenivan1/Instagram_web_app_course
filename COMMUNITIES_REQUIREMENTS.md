# Communities Feature Requirements Document

## Overview
This document outlines the requirements for implementing a "Communities" feature in the Instagram-like web application, allowing users to create, manage, and subscribe to communities with post sharing capabilities.

## 1. Functional Requirements

### 1.1 Community Creation
- **FR-1.1**: Any authenticated user (admin or non-admin) can create a community
- **FR-1.2**: Community must have a unique name (case-insensitive)
- **FR-1.3**: Community creation requires:
  - Community name (3-50 characters, alphanumeric + spaces + basic punctuation)
  - Optional description (max 200 characters)
- **FR-1.4**: User who creates the community becomes the "Community Manager"
- **FR-1.5**: System stores creation timestamp and creator information

### 1.2 Community Management
- **FR-2.1**: Only the Community Manager can manage the community (regardless of admin status)
- **FR-2.2**: Community Manager can:
  - View list of all subscribers
  - Rename the community (must remain unique)
  - Edit community description
- **FR-2.3**: Community Manager cannot delete communities (for data integrity)
- **FR-2.4**: If Community Manager account is deleted, community becomes "orphaned" but remains accessible

### 1.3 Community Subscription
- **FR-3.1**: Any authenticated user can subscribe to any community
- **FR-3.2**: Users cannot subscribe to the same community twice
- **FR-3.3**: Users can unsubscribe from communities at any time
- **FR-3.4**: Community Managers are automatically subscribed to their own communities
- **FR-3.5**: Subscription/unsubscription is immediate and affects post visibility immediately

### 1.4 Posts System
- **FR-4.1**: Users can create posts and assign them to communities they've subscribed to
- **FR-4.2**: Posts must belong to exactly one community (no general/unassigned posts)
- **FR-4.3**: Posts require:
  - **Media upload (REQUIRED)**: Either image (JPG, PNG, GIF, max 5MB) or short video (MP4, MOV, max 20MB)
  - **Community assignment (REQUIRED)**: Must select a subscribed community
  - **Title (OPTIONAL)**: 0-100 characters if provided
- **FR-4.4**: Users can only post to communities they're subscribed to
- **FR-4.5**: Community Managers can post to their own communities even if not explicitly subscribed
- **FR-4.6**: Posts system is separate from and coexists with the existing news feed system
- **FR-4.7**: All user inputs must be validated on both client and server side

### 1.5 Post Visibility and Home Feed
- **FR-5.1**: Home page displays a unified feed containing:
  - All posts from communities the user is subscribed to
  - All posts created by the user themselves
- **FR-5.2**: Users can filter the home feed to show only their own posts via checkbox
- **FR-5.3**: Posts are displayed chronologically (newest first)
- **FR-5.4**: Each post displays: media (image/video), optional title, author name, community name, creation timestamp
- **FR-5.5**: Community Managers can see all posts in their communities when viewing community-specific pages

### 1.6 Discovery
- **FR-6.1**: Users can browse/search available communities
- **FR-6.2**: Community list shows: name, description, manager name
- **FR-6.3**: Users can see which communities they're subscribed to
- **FR-6.4**: Users can see which communities they manage

## 2. Technical Requirements

### 2.1 Database Schema

#### 2.1.1 Communities Collection
```javascript
{
  _id: ObjectId,
  name: String (unique, indexed),
  description: String,
  managerId: String, // References User.id
  managerName: String, // Denormalized for performance
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.1.2 Community Subscriptions Collection
```javascript
{
  _id: ObjectId,
  userId: String, // References User.id
  communityId: String, // References Community._id
  subscribedAt: Date,
  // Compound unique index on (userId, communityId)
}
```

#### 2.1.3 Posts Collection
```javascript
{
  _id: ObjectId,
  title: String (optional), // 0-100 characters
  mediaUrl: String (required), // Stored file path for uploaded image/video
  mediaType: String (required), // 'image' or 'video'
  mediaFileName: String (required), // Original filename for reference
  authorId: String, // References User.id
  authorName: String, // Denormalized
  communityId: String, // References Community._id
  communityName: String, // Denormalized
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 API Endpoints

#### 2.2.1 Community Management
- `POST /communities` - Create new community
- `GET /communities` - List all communities with search/filter
- `GET /communities/:id` - Get community details
- `PUT /communities/:id` - Update community (manager only)
- `GET /communities/:id/subscribers` - List community subscribers (manager only)
- `GET /communities/managed` - Get communities managed by current user

#### 2.2.2 Subscription Management  
- `POST /communities/:id/subscribe` - Subscribe to community
- `DELETE /communities/:id/unsubscribe` - Unsubscribe from community
- `GET /user/subscriptions` - Get user's subscribed communities

#### 2.2.3 Posts Management
- `POST /posts` - Create new post in community (supports multipart/form-data for image/video uploads)
- `GET /feed` - Get home feed (subscribed communities + own posts)
- `GET /feed?my-posts-only=true` - Get home feed filtered to user's own posts only
- `GET /posts/my` - Get current user's posts
- `GET /communities/:id/posts` - Get posts in specific community
- `PUT /posts/:id` - Update post (author only, title only)
- `DELETE /posts/:id` - Delete post (author only)
- `GET /uploads/:filename` - Serve uploaded images and videos

### 2.3 Authorization Rules
- **CRUD Communities**: Any authenticated user can create; only manager can update
- **Subscribe/Unsubscribe**: Any authenticated user
- **View Subscribers**: Only community manager
- **Create Posts**: Only subscribed users (+ managers of their own communities)
- **View Posts**: Based on subscription + own posts
- **Update/Delete Posts**: Only post author

### 2.4 Frontend Components

#### 2.4.1 New Pages Required
- `/communities` - Browse and manage communities
- `/communities/:id` - Community detail page
- `/posts/create` - Create new post
- **Enhanced `/home`** - Main feed showing posts from subscribed communities + own posts

#### 2.4.2 Navigation Updates
- Add "Communities" to main navigation
- Add "My Posts" to user menu
- Keep existing news page separate from new posts system

#### 2.4.3 UI Components
- Community card component (list view)
- Community management panel
- Post creation form with:
  - Community selector dropdown
  - Media upload (image/video) with preview
  - Optional title input field
  - Comprehensive client-side validation
- Post card component displaying:
  - Media content (image or video player)
  - Optional title
  - Author name and community name
  - Timestamp
- Home feed with "My Posts Only" filter checkbox
- Subscription toggle button
- Community search/filter interface
- Media upload widget supporting both images and videos
- Upload progress indicator and validation feedback

### 2.5 File Storage and Upload Handling
- **File Storage**: Store uploaded media files in `/uploads` directory on server
- **File Validation**: 
  - Images: JPG, PNG, GIF formats, max 5MB
  - Videos: MP4, MOV formats, max 20MB
  - Comprehensive client and server-side validation
- **File Serving**: Serve media files via static route `/uploads/:filename`
- **Security**: Generate unique filenames to prevent conflicts and path traversal attacks
- **Cleanup**: Implement cleanup mechanism for orphaned files when posts are deleted

### 2.6 Integration with Existing System
- **Session Management**: Use existing SessionManager for authentication
- **User System**: Integrate with existing User model
- **Database**: Use existing MongoDB connection with new collections
- **Routing**: Follow existing pattern (routes → controllers → models)
- **Middleware**: Use existing authMiddleware for route protection
- **News System**: Keep existing news system completely separate from posts system
- **Frontend Technologies**: Use only pure HTML, CSS (with Bootstrap), and JavaScript as per cursor rules
- **AJAX Requests**: Use XMLHttpRequest instead of fetch API as per cursor rules

### 2.7 Input Validation Requirements
- **Client-Side Validation**:
  - Real-time validation feedback for all form inputs
  - File type and size validation before upload
  - Community name uniqueness check
  - Title length validation (0-100 characters)
- **Server-Side Validation**:
  - All client validations must be duplicated on server
  - Sanitize all text inputs to prevent XSS
  - Validate file uploads (type, size, content)
  - Database constraint validation
  - Proper error responses with specific validation messages

### 2.8 Data Migration Strategy
- Since this is a new feature, no data migration needed
- Initialize with empty collections
- Consider creating a few sample communities for testing

## 3. Non-Functional Requirements

### 3.1 Performance
- Community listing should load within 2 seconds
- Post feed should load within 3 seconds
- Support up to 1000 communities and 10000 posts initially
- Use pagination for large result sets (20 items per page)

### 3.2 Scalability
- Database indexes on frequently queried fields
- Denormalized data for common read operations
- Efficient subscription lookups via compound indexes

### 3.3 Security
- All API endpoints require authentication
- Proper authorization checks on community management
- Input validation and sanitization
- XSS protection for user-generated content

### 3.4 Usability
- Intuitive community discovery interface
- Clear indication of subscription status
- Easy post creation workflow
- Responsive design for mobile compatibility

### 3.5 Data Integrity
- Referential integrity via application logic
- Atomic operations for critical transactions
- Proper error handling and user feedback
- Backup strategy for user-generated content

## 4. Implementation Phases

### Phase 1: Core Infrastructure
1. Database models and collections
2. Basic API endpoints for communities
3. Authentication and authorization middleware

### Phase 2: Community Management
1. Community CRUD operations
2. Subscription system
3. Community management interface

### Phase 3: Posts System
1. Post creation and management
2. Post visibility logic
3. Posts feed interface

### Phase 4: User Experience
1. Community discovery
2. Enhanced UI/UX
3. Search and filtering
4. Mobile responsiveness

### Phase 5: Polish and Optimization
1. Performance optimization
2. Error handling improvements
3. Testing and bug fixes
4. Documentation

## 5. Success Criteria
- Users can successfully create and manage communities
- Subscription system works reliably
- Posts are visible only to appropriate users
- Community managers can effectively manage their communities
- System remains performant with expected load
- All existing functionality continues to work

## 6. Future Considerations
- Community avatars/images
- Post categories/tags within communities
- Community moderation features
- **Community analytics** (subscriber count, post count, engagement metrics)
- Post reactions/likes system
- Community member roles (beyond just manager)
- Post comments and discussions
- Community privacy settings (public/private communities)
- Advanced media features (video thumbnails, compression, streaming)
- Post editing capabilities (beyond title)

---

**Document Version**: 1.0  
**Date**: Current  
**Status**: Draft - Pending Approval