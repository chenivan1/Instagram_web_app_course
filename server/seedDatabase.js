const { ObjectId } = require('mongodb');
const connectDB = require('./db');

/**
 * Mock data for seeding the database
 */
const mockData = {
    users: [
        {
            id: '507f1f77bcf86cd799439011',
            name: 'Chen Evan',
            email: 'chen@gmail.com',
            password: 'password',
            isAdmin: true,
            address: {
                name: "123 Main Street, New York, NY 10001",
                lat: 40.7128,
                lng: -74.0060,
            },
            createdAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
            id: '507f1f77bcf86cd799439012',
            name: 'Yehonatan Harit',
            email: 'harit@gmail.com',
            password: 'password',
            isAdmin: true,
            address: {
                name: "456 Oak Avenue, Los Angeles, CA 90210",
                lat: 34.0522,
                lng: -118.2437,
            },
            createdAt: new Date('2024-01-01T11:00:00Z'),
        },
        {
            id: '507f1f77bcf86cd799439013',
            name: 'Dror K',
            email: 'dror@gmail.com',
            password: 'password',
            isAdmin: true,
            address: {
                name: "789 Admin Street, Chicago, IL 60601",
                lat: 41.8781,
                lng: -87.6298,
            },
            createdAt: new Date('2024-01-01T12:00:00Z'),
        },
        {
            id: '507f1f77bcf86cd799439014',
            name: 'Yossi Cohen',
            email: 'yossi@gmail.com',
            password: 'password',
            isAdmin: false,
            address: {
                name: "321 Pine Street, Seattle, WA 98101",
                lat: 47.6062,
                lng: -122.3321,
            },
            createdAt: new Date('2024-01-02T09:00:00Z'),
        },
        {
            id: '507f1f77bcf86cd799439015',
            name: 'Dana Levi',
            email: 'dana@gmail.com',
            password: 'password',
            isAdmin: false,
            address: {
                name: "654 Elm Avenue, Austin, TX 78701",
                lat: 30.2672,
                lng: -97.7431,
            },
            createdAt: new Date('2024-01-02T14:00:00Z'),
        }
    ],

    communities: [
        {
            id: '507f1f77bcf86cd799439021',
            name: 'Tech Enthusiasts',
            description: 'A community for technology lovers to share and discuss the latest tech trends, gadgets, and innovations.',
            managerId: '507f1f77bcf86cd799439011',
            managerName: 'Chen Evan',
            createdAt: new Date('2024-01-01T15:00:00Z'),
            updatedAt: new Date('2024-01-01T15:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439022',
            name: 'Photography Club',
            description: 'Share your best shots, get feedback, and learn new photography techniques from fellow photographers.',
            managerId: '507f1f77bcf86cd799439012',
            managerName: 'Yehonatan Harit',
            createdAt: new Date('2024-01-02T10:00:00Z'),
            updatedAt: new Date('2024-01-02T10:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439023',
            name: 'Food & Recipes',
            description: 'Discover delicious recipes, share your culinary creations, and connect with food enthusiasts.',
            managerId: '507f1f77bcf86cd799439013',
            managerName: 'Dror K',
            createdAt: new Date('2024-01-03T09:00:00Z'),
            updatedAt: new Date('2024-01-03T09:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439024',
            name: 'Travel Adventures',
            description: 'Share your travel experiences, discover new destinations, and get travel tips from fellow adventurers.',
            managerId: '507f1f77bcf86cd799439011',
            managerName: 'Chen Evan',
            createdAt: new Date('2024-01-04T11:00:00Z'),
            updatedAt: new Date('2024-01-04T11:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439025',
            name: 'Fitness & Health',
            description: 'Motivate each other on fitness journeys, share workout routines, and discuss healthy lifestyle tips.',
            managerId: '507f1f77bcf86cd799439012',
            managerName: 'Yehonatan Harit',
            createdAt: new Date('2024-01-05T08:00:00Z'),
            updatedAt: new Date('2024-01-05T08:00:00Z')
        }
    ],

    posts: [
        {
            id: '507f1f77bcf86cd799439031',
            title: 'Latest AI Breakthrough',
            authorId: '507f1f77bcf86cd799439011',
            authorName: 'Chen Evan',
            authorProfilePicture: null,
            communityId: '507f1f77bcf86cd799439021',
            communityName: 'Tech Enthusiasts',
            likes: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
            likesCount: 2,
            comments: [
                {
                    id: '507f1f77bcf86cd799439041',
                    text: 'This is fascinating! Thanks for sharing.',
                    authorId: '507f1f77bcf86cd799439012',
                    authorName: 'Yehonatan Harit',
                    authorProfilePicture: null,
                    createdAt: new Date('2024-01-15T10:30:00Z')
                }
            ],
            createdAt: new Date('2024-01-15T09:00:00Z'),
            updatedAt: new Date('2024-01-15T09:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439032',
            title: 'Sunset Photography Tips',
            authorId: '507f1f77bcf86cd799439012',
            authorName: 'Yehonatan Harit',
            authorProfilePicture: null,
            communityId: '507f1f77bcf86cd799439022',
            communityName: 'Photography Club',
            likes: ['507f1f77bcf86cd799439011'],
            likesCount: 1,
            comments: [],
            createdAt: new Date('2024-01-14T18:00:00Z'),
            updatedAt: new Date('2024-01-14T18:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439033',
            title: 'Homemade Pizza Recipe',
            authorId: '507f1f77bcf86cd799439013',
            authorName: 'Dror K',
            authorProfilePicture: null,
            communityId: '507f1f77bcf86cd799439023',
            communityName: 'Food & Recipes',
            likes: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
            likesCount: 2,
            comments: [
                {
                    id: '507f1f77bcf86cd799439042',
                    text: 'Looks delicious! Can\'t wait to try this recipe.',
                    authorId: '507f1f77bcf86cd799439014',
                    authorName: 'Yossi Cohen',
                    authorProfilePicture: null,
                    createdAt: new Date('2024-01-13T20:15:00Z')
                }
            ],
            createdAt: new Date('2024-01-13T19:30:00Z'),
            updatedAt: new Date('2024-01-13T19:30:00Z')
        },
        {
            id: '507f1f77bcf86cd799439034',
            title: 'My Trip to Japan',
            imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
            authorId: '507f1f77bcf86cd799439015',
            authorName: 'Dana Levi',
            authorProfilePicture: null,
            communityId: '507f1f77bcf86cd799439024',
            communityName: 'Travel Adventures',
            likes: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', '507f1f77bcf86cd799439014'],
            likesCount: 3,
            comments: [
                {
                    id: '507f1f77bcf86cd799439043',
                    text: 'Amazing photos! Japan is on my bucket list.',
                    authorId: '507f1f77bcf86cd799439012',
                    authorName: 'Yehonatan Harit',
                    authorProfilePicture: null,
                    createdAt: new Date('2024-01-12T16:45:00Z')
                }
            ],
            createdAt: new Date('2024-01-12T15:20:00Z'),
            updatedAt: new Date('2024-01-12T15:20:00Z')
        },
        {
            id: '507f1f77bcf86cd799439035',
            title: 'Morning Workout Routine',
            authorId: '507f1f77bcf86cd799439014',
            authorName: 'Yossi Cohen',
            authorProfilePicture: null,
            communityId: '507f1f77bcf86cd799439025',
            communityName: 'Fitness & Health',
            likes: ['507f1f77bcf86cd799439015'],
            likesCount: 1,
            comments: [],
            createdAt: new Date('2024-01-11T07:30:00Z'),
            updatedAt: new Date('2024-01-11T07:30:00Z')
        }
    ],

    subscriptions: [
        // Chen Evan subscriptions
        {
            id: '507f1f77bcf86cd799439051',
            userId: '507f1f77bcf86cd799439011',
            communityId: '507f1f77bcf86cd799439021', // Tech Enthusiasts (he manages this)
            subscribedAt: new Date('2024-01-01T15:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439052',
            userId: '507f1f77bcf86cd799439011',
            communityId: '507f1f77bcf86cd799439022', // Photography Club
            subscribedAt: new Date('2024-01-02T10:30:00Z')
        },
        {
            id: '507f1f77bcf86cd799439053',
            userId: '507f1f77bcf86cd799439011',
            communityId: '507f1f77bcf86cd799439023', // Food & Recipes
            subscribedAt: new Date('2024-01-03T09:30:00Z')
        },

        // Yehonatan Harit subscriptions
        {
            id: '507f1f77bcf86cd799439054',
            userId: '507f1f77bcf86cd799439012',
            communityId: '507f1f77bcf86cd799439021', // Tech Enthusiasts
            subscribedAt: new Date('2024-01-01T16:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439055',
            userId: '507f1f77bcf86cd799439012',
            communityId: '507f1f77bcf86cd799439022', // Photography Club (she manages this)
            subscribedAt: new Date('2024-01-02T10:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439056',
            userId: '507f1f77bcf86cd799439012',
            communityId: '507f1f77bcf86cd799439024', // Travel Adventures
            subscribedAt: new Date('2024-01-04T11:30:00Z')
        },

        // Admin User subscriptions
        {
            id: '507f1f77bcf86cd799439057',
            userId: '507f1f77bcf86cd799439013',
            communityId: '507f1f77bcf86cd799439021', // Tech Enthusiasts
            subscribedAt: new Date('2024-01-01T17:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439058',
            userId: '507f1f77bcf86cd799439013',
            communityId: '507f1f77bcf86cd799439023', // Food & Recipes (he manages this)
            subscribedAt: new Date('2024-01-03T09:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439059',
            userId: '507f1f77bcf86cd799439013',
            communityId: '507f1f77bcf86cd799439025', // Fitness & Health
            subscribedAt: new Date('2024-01-05T08:30:00Z')
        },

        // Yossi Cohen subscriptions
        {
            id: '507f1f77bcf86cd799439060',
            userId: '507f1f77bcf86cd799439014',
            communityId: '507f1f77bcf86cd799439023', // Food & Recipes
            subscribedAt: new Date('2024-01-03T14:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439061',
            userId: '507f1f77bcf86cd799439014',
            communityId: '507f1f77bcf86cd799439025', // Fitness & Health
            subscribedAt: new Date('2024-01-05T09:00:00Z')
        },

        // Sarah Wilson subscriptions
        {
            id: '507f1f77bcf86cd799439062',
            userId: '507f1f77bcf86cd799439015',
            communityId: '507f1f77bcf86cd799439022', // Photography Club
            subscribedAt: new Date('2024-01-02T13:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439063',
            userId: '507f1f77bcf86cd799439015',
            communityId: '507f1f77bcf86cd799439024', // Travel Adventures
            subscribedAt: new Date('2024-01-04T12:00:00Z')
        },
        {
            id: '507f1f77bcf86cd799439064',
            userId: '507f1f77bcf86cd799439015',
            communityId: '507f1f77bcf86cd799439025', // Fitness & Health
            subscribedAt: new Date('2024-01-05T10:00:00Z')
        }
    ]
};

/**
 * Seeds the database with mock data
 * @param {boolean} clearExisting - Whether to clear existing data before seeding
 */
async function seedDatabase(clearExisting = true) {
    try {
        console.log('🌱 Starting database seeding...');
        const db = await connectDB();

        // Clear existing data if requested
        if (clearExisting) {
            console.log('🧹 Clearing existing data...');
            await db.collection('users').deleteMany({});
            await db.collection('communities').deleteMany({});
            await db.collection('posts').deleteMany({});
            await db.collection('community_subscriptions').deleteMany({});
            console.log('✅ Existing data cleared');
        }

        // Insert users
        console.log('👥 Inserting users...');
        const userResult = await db.collection('users').insertMany(mockData.users);
        console.log(`✅ Inserted ${userResult.insertedCount} users`);

        // Insert communities
        console.log('🏘️  Inserting communities...');
        const communityResult = await db.collection('communities').insertMany(mockData.communities);
        console.log(`✅ Inserted ${communityResult.insertedCount} communities`);

        // Insert posts
        console.log('📝 Inserting posts...');
        const postResult = await db.collection('posts').insertMany(mockData.posts);
        console.log(`✅ Inserted ${postResult.insertedCount} posts`);

        // Insert subscriptions
        console.log('📋 Inserting community subscriptions...');
        const subscriptionResult = await db.collection('community_subscriptions').insertMany(mockData.subscriptions);
        console.log(`✅ Inserted ${subscriptionResult.insertedCount} subscriptions`);

        console.log('🎉 Database seeding completed successfully!');

        // Return summary
        return {
            success: true,
            summary: {
                users: userResult.insertedCount,
                communities: communityResult.insertedCount,
                posts: postResult.insertedCount,
                subscriptions: subscriptionResult.insertedCount
            }
        };

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

/**
 * Check if database already has data
 */
async function isDatabaseEmpty() {
    try {
        const db = await connectDB();

        const userCount = await db.collection('users').countDocuments();
        const communityCount = await db.collection('communities').countDocuments();
        const postCount = await db.collection('posts').countDocuments();
        const subscriptionCount = await db.collection('community_subscriptions').countDocuments();

        return userCount === 0 && communityCount === 0 && postCount === 0 && subscriptionCount === 0;
    } catch (error) {
        console.error('Error checking database status:', error);
        return false;
    }
}

module.exports = {
    seedDatabase,
    isDatabaseEmpty,
    mockData
};