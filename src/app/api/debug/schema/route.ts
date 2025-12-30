import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = getSupabase();
    
    // Try to fetch one row from 'Booking' table to see columns
    const { data: bookingData, error: bookingError } = await supabase
      .from('Booking')
      .select('*')
      .limit(1);

    if (bookingError) {
        // If Booking fails, try 'Reservation'
        const { data: resData, error: resError } = await supabase
        .from('Reservation')
        .select('*')
        .limit(1);
        
        if (resError) {
             // Try 'Action' table (common in some asset systems)
             const { data: actionData, error: actionError } = await supabase
             .from('Action')
             .select('*')
             .limit(1);

             if (actionError) {
                return NextResponse.json({ 
                    message: 'Could not find Booking, Reservation, or Action table', 
                    bookingError, 
                    resError,
                    actionError
                }, { status: 404 });
             }
             return NextResponse.json({ table: 'Action', sample: actionData });
        }
        return NextResponse.json({ table: 'Reservation', sample: resData });
    }

    return NextResponse.json({ table: 'Booking', sample: bookingData });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
