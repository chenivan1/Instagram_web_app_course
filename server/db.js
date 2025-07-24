const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'instagram_web_app_course';

let mongoDBClient;
let db;

async function connectDB() {
  if (!mongoDBClient) {
    mongoDBClient = new MongoClient(url, { useUnifiedTopology: true });
    await mongoDBClient.connect();
    db = mongoDBClient.db(dbName);
  }
  
  return db;
}

module.exports = connectDB; 