import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const quotesFilePath = path.join(process.cwd(), 'src/data/quotes.json');

async function getQuotesData() {
  const data = await fs.readFile(quotesFilePath, 'utf-8');
  return JSON.parse(data);
}

async function setQuotesData(data: any) {
  await fs.writeFile(quotesFilePath, JSON.stringify(data, null, 2));
}

// POST /api/quotes/[id]/book - Approve quote and create bookings in Supabase
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const quotes = await getQuotesData();
    const quoteIndex = quotes.findIndex((q: any) => q.id === id);

    if (quoteIndex === -1) {
      return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    }

    const quote = quotes[quoteIndex];
    const supabase = getSupabase();
    const bookings = [];
    const errors = [];

    // Iterate through all sections and items
    for (const section of quote.sections) {
      for (const item of section.items) {
        // Only book items that are linked to real equipment (have equipmentId)
        if (item.equipmentId) {
          // Construct booking object
          // Note: Adjust table name and column names based on actual shelf.nu schema
          const bookingPayload = {
            assetId: item.equipmentId, // or asset_id
            startDate: quote.startDate, // or start_date
            endDate: quote.endDate,     // or end_date
            notes: `Booked via AV Quote Pro for ${quote.eventName}`,
            status: 'CONFIRMED'
          };

          // Attempt to insert into 'Booking' table
          const { data, error } = await supabase
            .from('Booking')
            .insert([bookingPayload])
            .select();

          if (error) {
            console.error(`Failed to book item ${item.name}:`, error);
            errors.push({ itemId: item.id, error: error.message });
          } else {
            bookings.push(data);
          }
        }
      }
    }

    // Update quote status locally
    quote.status = 'Approved';
    quotes[quoteIndex] = quote;
    await setQuotesData(quotes);

    if (errors.length > 0) {
      return NextResponse.json({ 
        message: 'Quote approved but some items failed to book', 
        bookings, 
        errors 
      }, { status: 207 }); // 207 Multi-Status
    }

    return NextResponse.json({ message: 'Quote approved and all items booked successfully', bookings });

  } catch (error: any) {
    console.error('Booking failed:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
