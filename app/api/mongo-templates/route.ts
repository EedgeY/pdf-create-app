import { NextResponse } from 'next/server';

const API_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_MONGODB_DATA_API_URL
    : process.env.NEXT_PUBLIC_MONGODB_DATA_API_URL;

const DATA_SOURCE =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_MONGODB_DATA_SOURCE
    : process.env.NEXT_PUBLIC_MONGODB_DATA_SOURCE;

// 環境に応じて適切な値を選択
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

export async function GET(request: Request) {
  try {
    const result = await makeApiRequest('find', {});
    return NextResponse.json(result.documents);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, data } = await request.json();
    if (!name || !data) {
      return NextResponse.json(
        { error: 'Name and data are required' },
        { status: 400 }
      );
    }

    const result = await makeApiRequest('updateOne', {
      filter: { name },
      update: {
        $set: { data },
      },
      upsert: true,
    });

    return NextResponse.json({
      message: 'Template saved successfully',
      result,
    });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    if (!name) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    const result = await makeApiRequest('deleteOne', {
      filter: { name },
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
