import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/equipment - Fetches assets from the shelf.nu 'Asset' table
export async function GET() {
  // We only fetch a subset of fields needed for the quote.
  // We also assume 'valuation' is the daily price.
  const { data, error } = await supabase
    .from('Asset')
    .select('id, title, description, valuation, status')
    .eq('availableToBook', true); // Only fetch items that are available to book

  if (error) {
    console.error('Error fetching assets from shelf.nu:', error);
    return NextResponse.json({ message: 'Error fetching assets' }, { status: 500 });
  }

  // Map the 'Asset' fields to our application's 'Equipment' fields
  const equipment = data.map(asset => ({
      id: asset.id,
      name: asset.title,
      description: asset.description,
      dailyPrice: asset.valuation || 0, // Default to 0 if valuation is null
      status: asset.status,
  }));

  return NextResponse.json(equipment);
}

// POST endpoint is intentionally removed to avoid modifying shelf.nu's asset list directly.
// Asset management should be done via the shelf.nu interface.
