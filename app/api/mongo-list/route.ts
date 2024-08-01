'use server';

import { NextResponse } from 'next/server';

// 環境変数から適切な値を取得
const API_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_MONGODB_DATA_API_URL
    : process.env.NEXT_PUBLIC_MONGODB_DATA_API_URL;

const DATA_SOURCE =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_MONGODB_DATA_SOURCE
    : process.env.NEXT_PUBLIC_MONGODB_DATA_SOURCE;

const API_KEY =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_API_KEY
    : process.env.NEXT_PUBLIC_MONGODB_API_KEY;

const DATABASE =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_MONGODB_DB
    : process.env.NEXT_PUBLIC_MONGODB_DB;

const COLLECTION =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_MONGODB_COLLECTION
    : process.env.NEXT_PUBLIC_MONGODB_COLLECTION;

if (!API_URL || !API_KEY || !DATA_SOURCE || !DATABASE || !COLLECTION) {
  throw new Error('Missing MongoDB Atlas Data API configuration');
}

async function makeApiRequest(action: string, data: any) {
  if (!API_URL || !API_KEY || !DATA_SOURCE || !DATABASE || !COLLECTION) {
    throw new Error('Missing MongoDB Atlas Data API configuration');
  }
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': API_KEY,
    };

    const response = await fetch(`${API_URL}/action/${action}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        ...data,
        dataSource: DATA_SOURCE,
        database: DATABASE,
        collection: COLLECTION,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in MongoDB operation (${action}):`, error);
    throw new Error('Database operation failed');
  }
}

export async function GET() {
  try {
    const result = await makeApiRequest('find', {
      filter: {},
      limit: 1000, // デフォルトのリミットを設定
    });
    return NextResponse.json(result.documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
