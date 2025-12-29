import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const quotesFilePath = path.join(process.cwd(), 'src/data/quotes.json');

// Helper function to read quotes data
async function getQuotesData() {
  const data = await fs.readFile(quotesFilePath, 'utf-8');
  return JSON.parse(data);
}

// Helper function to write quotes data
async function setQuotesData(data: any) {
  await fs.writeFile(quotesFilePath, JSON.stringify(data, null, 2));
}

// GET /api/quotes - Get all quotes
export async function GET() {
  try {
    const quotes = await getQuotesData();
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Failed to read quotes data:', error);
    return NextResponse.json({ message: 'Error reading quotes data' }, { status: 500 });
  }
}

// POST /api/quotes - Add new quote
export async function POST(req: NextRequest) {
  try {
    const newQuote = await req.json();
    const quotes = await getQuotesData();

    // Generate a simple unique ID
    const id = Date.now().toString();

    quotes.push({ id, ...newQuote });
    await setQuotesData(quotes);

    return NextResponse.json({ message: 'Quote created successfully', id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create quote:', error);
    return NextResponse.json({ message: 'Error creating quote' }, { status: 500 });
  }
}
