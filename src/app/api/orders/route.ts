import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderEmails } from '@/lib/email';
import type { OrderEmailParams } from '@/lib/order-email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      product_id,
      quantity,
      total_price,
      delivery_address,
      phone,
      notes,
      user_name,
      user_email,
      user_district,
      user_city,
      user_postal_code,
      user_country,
      delivery_type,
      online_support
    } = body;

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



    // Check if user has any non-cancelled orders today
    if (todaysOrders && todaysOrders.length > 0) {
      const activeOrders = todaysOrders.filter(order => order.status_id !== 10); // 10 = cancelled


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

    // User bilgilerini JSON olarak hazırla
    const userInfo = {
      user_id: user_id,
      name: user_name || '',
      email: user_email || '',
      phone: phone,
      address: {
        full_address: delivery_address,
        district: user_district || '',
        city: user_city || '',
        postal_code: user_postal_code || '',
        country: user_country || 'Türkiye'
      },
      delivery_type: delivery_type || 'istanbul-installation',
      online_support: online_support || false,
      notes: notes || ''
    };

    // Create the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user: JSON.stringify(userInfo), // Kullanıcı bilgilerini JSON olarak kaydet
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

    // E-posta bildirimleri (fire-and-forget — hata siparişi engellemez)
    const emailParams: OrderEmailParams = {
      orderNumber: orderData.id.toString(),
      customerName: user_name ?? '',
      customerEmail: user_email ?? '',
      customerPhone: phone,
      deliveryType: delivery_type ?? 'domestic-cargo',
      address: delivery_address,
      district: user_district ?? '',
      city: user_city ?? '',
      country: user_country ?? 'Türkiye',
      totalAmount: total_price.toFixed(2),
      paymentMethod: 'bank_transfer',
      products: [{
        name: 'Sipariş Ürünü',
        quantity: quantity,
        price: (total_price / quantity).toFixed(2),
      }],
      notes: notes ?? undefined,
    };

    void sendOrderEmails(emailParams);

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

    // Get all orders first (since user field is now JSON, we can't filter directly)
    const { data: allOrders, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Filter orders by user_id from JSON data
    const userOrders = allOrders?.filter(order => {
      try {
        const userInfo = typeof order.user === 'string' ? JSON.parse(order.user) : order.user;
        return userInfo.user_id === userId;
      } catch (parseError) {
        // Fallback: check if user field directly matches userId (for old data)
        return order.user === userId;
      }
    }) || [];

    // Enrich orders with product information
    const enrichedOrders = await Promise.all(
      userOrders.map(async (order) => {
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