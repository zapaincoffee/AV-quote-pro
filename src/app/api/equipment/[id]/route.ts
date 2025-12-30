import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/equipment/[id] - Get single asset by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('Asset')
    .select('id, title, description, valuation, status')
    .eq('id', params.id)
    .single();

  if (error) {
    console.error(`Error fetching asset ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching asset' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ message: 'Asset not found' }, { status: 404 });
  }
  
  // Map the 'Asset' fields to our application's 'Equipment' fields
  const equipment = {
      id: data.id,
      name: data.title,
      description: data.description,
      dailyPrice: data.valuation || 0,
      status: data.status,
  };

  return NextResponse.json(equipment);
}

// PUT and DELETE endpoints are intentionally removed to avoid modifying shelf.nu's asset list directly.
