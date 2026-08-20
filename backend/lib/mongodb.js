// Import the mongoose library, which is an Object Data Modeling (ODM) library for MongoDB and Node.js.
const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// This function establishes a connection to the MongoDB database with serverless connection caching.
const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MongoDB Connection Warning: MONGODB_URI is not set in environment variables.');
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`MongoDB Atlas Connected Successfully`);
      return mongooseInstance;
    }).catch((err) => {
      console.error(`MongoDB Connection Error: ${err.message}`);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`Failed to connect to MongoDB: ${error.message}`);
  }

  return cached.conn;
};

// Export the connectDB function so it can be imported and used in other files (like server.js).
module.exports = connectDB;
