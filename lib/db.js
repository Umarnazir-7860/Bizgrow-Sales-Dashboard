import mongoose from "mongoose";

// 1. Aapki .env.local file se link uthata hai
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Pehle .env.local mein MONGODB_URI set karein!");
}

// 2. Next.js mein ye 'cached' variable zaroori hai. 
// Ye check karta hai ke kya pehle se connection khula hua hai?
// Taake har refresh par naya connection na banay (warna Mongo hang ho jata hai).
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Agar connection pehle se mojud hai, toh wahi wapis kar do
  if (cached.conn) {
    return cached.conn;
  }

  // Agar connection nahi hai, toh naya banao
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully!");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;