const mongoose = require('mongoose');
const env = require('./env');

let memoryServerInstance = null;

const connectDB = async () => {
  let uri = env.MONGODB_URI;

  try {
    if (uri === 'memory') {
      console.log('⚡ Using MongoDB In-Memory Server for zero-dependency local demo/testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      uri = memoryServerInstance.getUri();
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ Failed to connect to ${uri}: ${err.message}`);
    // If not production and not already on memory server, try fallback to memory server
    if (env.NODE_ENV !== 'production' && !memoryServerInstance) {
      console.log('🔄 Falling back to embedded MongoDB In-Memory instance so app continues seamlessly...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memoryUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`✅ MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
        return conn;
      } catch (memErr) {
        console.error('❌ In-Memory MongoDB fallback failed:', memErr.message);
        throw memErr;
      }
    }
    throw err;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
