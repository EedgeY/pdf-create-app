'use server';

import { MongoClient, ServerApiVersion } from 'mongodb';

const uri =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_MONGODB_URI
    : process.env.NEXT_PUBLIC_MONGODB_URI;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let isConnected = false;

export async function connectToMongoDB() {
  if (!isConnected) {
    try {
      await client.connect();
      await client.db('admin').command({ ping: 1 });
      isConnected = true;
      console.log('Successfully connected to MongoDB!');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  return client;
}

export async function closeMongoDB() {
  if (isConnected) {
    await client.close();
    isConnected = false;
    console.log('MongoDB connection closed.');
  }
}

export async function getMongoClient() {
  if (!isConnected) {
    await connectToMongoDB();
  }
  return client;
}
