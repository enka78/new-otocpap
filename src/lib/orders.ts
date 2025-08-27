import { supabase } from './supabase';

export interface CreateOrderData {
  // Müşteri Bilgileri
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  
  // Teslimat Adresi
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country?: string;
  };
  
  // Fatura Adresi (opsiyonel)
  billing_address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country?: string;
  };
  
  // Sipariş Kalemleri
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
  }[];
  
  // Fiyat Bilgileri
  subtotal: number;
  tax_amount?: number;
  shipping_cost?: number;
  discount_amount?: number;
  
  // Ödeme Bilgileri
  payment_method?: string;
  
  // Notlar
  customer_notes?: string;
}

// Sipariş numarası oluştur
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
}

// Sipariş oluştur
export async function createOrder(orderData: CreateOrderData, userId?: string) {
  try {
    const orderNumber = generateOrderNumber();
    const totalAmount = orderData.subtotal + 
                       (orderData.tax_amount || 0) + 
                       (orderData.shipping_cost || 0) - 
                       (orderData.discount_amount || 0);

    // Sipariş kaydını oluştur
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        user_id: userId,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        
        // Teslimat adresi
        shipping_address_line1: orderData.shipping_address.line1,
        shipping_address_line2: orderData.shipping_address.line2,
        shipping_city: orderData.shipping_address.city,
        shipping_state: orderData.shipping_address.state,
        shipping_postal_code: orderData.shipping_address.postal_code,
        shipping_country: orderData.shipping_address.country || 'Turkey',
        
        // Fatura adresi
        billing_address_line1: orderData.billing_address?.line1,
        billing_address_line2: orderData.billing_address?.line2,
        billing_city: orderData.billing_address?.city,
        billing_state: orderData.billing_address?.state,
        billing_postal_code: orderData.billing_address?.postal_code,
        billing_country: orderData.billing_address?.country,
        
        // Fiyat bilgileri
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount || 0,
        shipping_cost: orderData.shipping_cost || 0,
        discount_amount: orderData.discount_amount || 0,
        total_amount: totalAmount,
        
        // Ödeme bilgileri
        payment_method: orderData.payment_method,
        
        // Notlar
        customer_notes: orderData.customer_notes,
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Sipariş kalemlerini ekle
    const orderItems = await Promise.all(
      orderData.items.map(async (item) => {
        // Ürün bilgilerini al
        const { data: product } = await supabase
          .from('products')
          .select('name, stock_number, image1')
          .eq('id', item.product_id)
          .single();

        return {
          order_id: order.id,
          product_id: item.product_id,
          product_name: product?.name || 'Unknown Product',
          product_sku: product?.stock_number,
          product_image: product?.image1,
          unit_price: item.unit_price,
          quantity: item.quantity,
          total_price: item.unit_price * item.quantity,
        };
      })
    );

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // İlk durum kaydını ekle
    await supabase
      .from('order_status_history')
      .insert([{
        order_id: order.id,
        status: 'pending',
        notes: 'Sipariş oluşturuldu',
        created_by: userId,
      }]);

    return {
      success: true,
      order: {
        ...order,
        order_items: orderItems,
      },
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sipariş oluşturulurken hata oluştu',
    };
  }
}

// Sipariş durumunu güncelle
export async function updateOrderStatus(
  orderId: number, 
  newStatus: string, 
  notes?: string, 
  adminUserId?: string
) {
  try {
    // Sipariş durumunu güncelle
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'shipped' && { shipped_at: new Date().toISOString() }),
        ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() }),
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Durum geçmişine ekle
    await supabase
      .from('order_status_history')
      .insert([{
        order_id: orderId,
        status: newStatus,
        notes,
        created_by: adminUserId,
      }]);

    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sipariş durumu güncellenirken hata oluştu',
    };
  }
}

// Siparişleri listele
export async function getOrders(filters?: {
  status?: string;
  user_id?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image1
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, orders: data };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Siparişler getirilirken hata oluştu',
    };
  }
}

// Tek sipariş detayını getir
export async function getOrderById(orderId: number) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image1,
            stock_number
          )
        ),
        order_status_history (
          *
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return { success: true, order: data };
  } catch (error) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sipariş detayları getirilirken hata oluştu',
    };
  }
}