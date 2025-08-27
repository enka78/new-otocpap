import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, user_id } = body;

    if (!order_id || !user_id) {
      return NextResponse.json(
        { error: 'Order ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get the order to check if it can be cancelled
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        user,
        status_id,
        status:status_id (
          name
        )
      `)
      .eq('id', order_id)
      .eq('user', user_id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled (only order_received and order_confirmed can be cancelled)
    const cancellableStatuses = ['order_received', 'order_confirmed'];
    if (!cancellableStatuses.includes((order.status as any)?.name)) {
      return NextResponse.json(
        { error: 'This order cannot be cancelled at its current status' },
        { status: 400 }
      );
    }

    // Get cancelled status ID
    const { data: cancelledStatus, error: statusError } = await supabase
      .from('status')
      .select('id')
      .eq('name', 'order_cancelled')
      .single();

    if (statusError || !cancelledStatus) {
      return NextResponse.json(
        { error: 'Could not find cancelled status' },
        { status: 500 }
      );
    }

    // Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status_id: cancelledStatus.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .eq('user', user_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error cancelling order:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
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