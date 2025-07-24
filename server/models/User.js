const { ObjectId } = require('mongodb');
const connectDB = require('../db');

const useDb = true;

let mockUsers = [{
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password',
  createdAt: new Date(),
}];

const UserModel = {
  async find() {
    if (useDb) {
      const db = await connectDB();
      return db.collection('users').find().toArray();
    } else {
      return mockUsers;
    }
  },
  async findById(id) {
    if (useDb) {
      const db = await connectDB();
      return db.collection('users').findOne({ _id: new ObjectId(id) });
    } else {
      return mockUsers.find(u => u.id === id);
    }
  },
  async create(data) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('users').insertOne(data);
      return { _id: result.insertedId, ...data };
    } else {
      const user = { id: String(Date.now()), ...data };
      mockUsers.push(user);
      return user;
    }
  },
  async update(id, data) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: 'after' }
      );
      return result.value;
    } else {
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) return null;
      mockUsers[idx] = { ...mockUsers[idx], ...data };
      return mockUsers[idx];
    }
  },
  async delete(id) {
    if (useDb) {
      const db = await connectDB();
      const result = await db.collection('users').findOneAndDelete({ _id: new ObjectId(id) });
      return result.value;
    } else {
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) return null;
      const [deleted] = mockUsers.splice(idx, 1);
      return deleted;
    }
  },
};

module.exports = UserModel; 