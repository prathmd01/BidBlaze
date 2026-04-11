
import mongoose from 'mongoose'

// Direct connection to MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://dassatyam300:fYg74wKbtERMBcXd@cluster0.jjlawdr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

declare global {
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  } | undefined;
}

let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached!.conn) {
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached!.promise = mongoose.connect(MONGODB_URI, opts as mongoose.ConnectOptions).then((mongoose) => {
      console.log('Frontend connected to MongoDB Atlas');
      return mongoose
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached!.conn
}

export default dbConnect
