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

// GET /api/quotes/[id] - Get single quote by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const quotes = await getQuotesData();
    const quote = quotes.find((q: any) => q.id === id);

    if (quote) {
      return NextResponse.json(quote);
    } else {
      return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to get quote:', error);
    return NextResponse.json({ message: 'Error getting quote' }, { status: 500 });
  }
}

// PUT /api/quotes/[id] - Update quote by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updatedData = await req.json();
    let quotes = await getQuotesData();

    const index = quotes.findIndex((q: any) => q.id === id);

    if (index !== -1) {
      quotes[index] = { ...quotes[index], ...updatedData, id }; // Ensure ID remains
      await setQuotesData(quotes);
      return NextResponse.json({ message: 'Quote updated successfully' });
    } else {
      return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to update quote:', error);
    return NextResponse.json({ message: 'Error updating quote' }, { status: 500 });
  }
}

// DELETE /api/quotes/[id] - Delete quote by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    let quotes = await getQuotesData();

    const initialLength = quotes.length;
    quotes = quotes.filter((q: any) => q.id !== id);

    if (quotes.length < initialLength) {
      await setQuotesData(quotes);
      return NextResponse.json({ message: 'Quote deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to delete quote:', error);
    return NextResponse.json({ message: 'Error deleting quote' }, { status: 500 });
  }
}
