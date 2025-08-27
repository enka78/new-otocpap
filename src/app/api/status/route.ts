import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: statuses, error } = await supabase
      .from('status')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching statuses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch statuses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      statuses: statuses || []
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}