import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Get all orders with user and status information
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        users:user (
          id,
          email,
          full_name
        ),
        status:status_id (
          id,
          name,
          display_name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders || []
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status_id, delivery_date, delivery_time, delivery_notes } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status_id) {
      updateData.status_id = status_id;
    }

    if (delivery_date) {
      updateData.delivery_date = delivery_date;
    }

    if (delivery_time) {
      updateData.delivery_time = delivery_time;
    }

    if (delivery_notes !== undefined) {
      updateData.delivery_notes = delivery_notes;
    }

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order_id)
      .select(`
        *,
        users:user (
          id,
          email,
          full_name
        ),
        status:status_id (
          id,
          name,
          display_name,
          description
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}