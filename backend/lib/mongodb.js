// Import the mongoose library, which is an Object Data Modeling (ODM) library for MongoDB and Node.js.
const mongoose = require('mongoose');

// This function establishes a connection to the MongoDB database.
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MongoDB Connection Error: MONGODB_URI is not set. Copy backend/.env.example to backend/.env and set MONGODB_URI.');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // If the connection is successful, log a confirmation message to the console.
    console.log(`MongoDB Atlas Connected Successfully`);
    console.log(`Connected to: ${conn.connection.host}`);
  } catch (error) {
    // If an error occurs during the connection attempt, log the error message.
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Exit the Node.js process with a "failure" code (1). This is important because
    // if the app can't connect to the database, it can't function properly.
    process.exit(1);
  }
};

// Export the connectDB function so it can be imported and used in other files (like server.js).
module.exports = connectDB;
