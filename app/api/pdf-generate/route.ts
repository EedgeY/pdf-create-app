import { NextResponse } from 'next/server';

const API_URL = 'http://localhost:3001/v1/pdf';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    const pdfBlob = await response.blob();

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${
          body.templateName || 'generated'
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
