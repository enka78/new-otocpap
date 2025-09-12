import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, product_id, quantity, total_price, delivery_address, phone, notes } = body;

    // Validate required fields
    if (!user_id || !product_id || !quantity || !total_price || !delivery_address || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has an active order today using the same logic as checkDailyOrderLimit
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    console.log('API: Checking daily order limit for user:', user_id);
    console.log('API: Date range:', { start: start.toISOString(), end: end.toISOString() });

    const { data: todaysOrders, error: checkError } = await supabase
      .from('orders')
      .select('id, status_id, created_at')
      .eq('user', user_id)
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString());

    if (checkError) {
      console.error('Error checking existing orders:', checkError);
      return NextResponse.json(
        { error: 'Database error while checking existing orders' },
        { status: 500 }
      );
    }

    console.log('API: Today\'s orders found:', todaysOrders?.length || 0);

    // Check if user has any non-cancelled orders today
    if (todaysOrders && todaysOrders.length > 0) {
      const activeOrders = todaysOrders.filter(order => order.status_id !== 10); // 10 = cancelled
      console.log('API: Active orders:', activeOrders.length);
      
      if (activeOrders.length > 0) {
        return NextResponse.json(
          { error: 'Bugün zaten bir siparişiniz var. Yeni sipariş verebilmek için mevcut siparişinizi iptal etmeniz gerekiyor.' },
          { status: 400 }
        );
      }
    }

    // Get default status (order_received)
    const { data: statusData, error: statusError } = await supabase
      .from('status')
      .select('id')
      .eq('name', 'order_received')
      .single();

    if (statusError || !statusData) {
      console.error('Error getting status:', statusError);
      return NextResponse.json(
        { error: 'Could not find order status' },
        { status: 500 }
      );
    }

    // Create the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user: user_id,
        products: JSON.stringify([{ product_id, quantity, price: total_price / quantity }]),
        total: total_price,
        delivery_address,
        phone,
        notes,
        status_id: statusData.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: orderData
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's orders with status information
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        status:status_id (
          id,
          name,
          display_name,
          description
        )
      `)
      .eq('user', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Enrich orders with product information
    const enrichedOrders = await Promise.all(
      (orders || []).map(async (order) => {
        try {
          // Parse products JSON
          const products = JSON.parse(order.products || '[]');
          
          // Get product details for each product in the order
          const productDetails = await Promise.all(
            products.map(async (item: any) => {
              const { data: product } = await supabase
                .from('products')
                .select('id, name, brand, price, image_url, category')
                .eq('id', item.product_id)
                .single();
              
              return {
                ...item,
                product: product || null
              };
            })
          );

          return {
            ...order,
            product_details: productDetails
          };
        } catch (parseError) {
          console.error('Error parsing products for order:', order.id, parseError);
          return {
            ...order,
            product_details: []
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      orders: enrichedOrders
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}