import { log } from 'console';
import { supabase } from './supabase';

export interface DailyOrderCheck {
  canOrder: boolean;
  existingOrder?: {
    id: number;
    order_number: string;
    status: string;
    created_at: string;
    total_amount: number;
  };
  message: string;
}

/**
 * Bugünün başlangıç ve bitiş tarihlerini döndürür
 */
const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start, end };
};

/**
 * Kullanıcının aynı gün içerisinde sipariş verip veremeyeceğini kontrol eder
 * Mantık:
 * 1. Bugün oluşturulan siparişleri bul
 * 2. Cancelled (status_id = 10) olmayan siparişler varsa engelle
 * 3. Sadece cancelled siparişler varsa veya hiç sipariş yoksa izin ver
 */
export const checkDailyOrderLimit = async (userId: string): Promise<DailyOrderCheck> => {
  try {
    const { start, end } = getTodayRange();

    console.log('Checking daily order limit for user:', userId);
    console.log('Date range:', { start: start.toISOString(), end: end.toISOString() });

    // Bugünkü kullanıcının TÜM siparişlerini çek (iptal edilenler dahil)
    const { data: todaysOrders, error } = await supabase
      .from('orders')
      .select(`
        id, 
        order_number, 
        status_id,
        created_at, 
        total
      `)
      .eq('user', userId)
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return {
        canOrder: true,
        message: 'Sipariş kontrol edilemedi, sipariş verilebilir.'
      };
    }

    console.log('Today\'s orders found:', todaysOrders?.length || 0);
    console.log('Orders:', todaysOrders);

    // Eğer bugün hiç sipariş yoksa, sipariş verilebilir
    if (!todaysOrders || todaysOrders.length === 0) {
      console.log('No orders today, can order');
      return {
        canOrder: true,
        message: 'Bugün henüz sipariş vermediniz. Yeni sipariş verebilirsiniz.'
      };
    }

    // Bugünkü siparişleri status'larına göre ayır
    const cancelledOrders = todaysOrders.filter(order => order.status_id === 10);
    const activeOrders = todaysOrders.filter(order => order.status_id !== 10);

    console.log('Cancelled orders:', cancelledOrders.length);
    console.log('Active orders:', activeOrders.length);

    // Eğer aktif (iptal edilmemiş) sipariş varsa, yeni sipariş verilemez
    if (activeOrders.length > 0) {
      const latestActiveOrder = activeOrders[0];
      console.log('Found active order, cannot order:', latestActiveOrder);
      
      return {
        canOrder: false,
        existingOrder: {
          id: latestActiveOrder.id as number,
          order_number: latestActiveOrder.order_number as string,
          status: `status_${latestActiveOrder.status_id}`,
          created_at: latestActiveOrder.created_at as string,
          total_amount: latestActiveOrder.total as number
        },
        message: `Bugün zaten bir siparişiniz var (Sipariş #${latestActiveOrder.order_number || latestActiveOrder.id}). Yeni sipariş verebilmek için mevcut siparişinizi iptal etmeniz gerekiyor.`
      };
    }

    // Sadece iptal edilmiş siparişler varsa, yeni sipariş verilebilir
    console.log('Only cancelled orders found, can order');
    return {
      canOrder: true,
      message: 'Önceki siparişiniz iptal edildi. Yeni sipariş verebilirsiniz.'
    };

  } catch (error) {
    console.error('Error in checkDailyOrderLimit:', error);
    return {
      canOrder: true,
      message: 'Sipariş kontrol edilemedi, sipariş verilebilir.'
    };
  }
};

/**
 * Kullanıcının siparişini iptal eder
 */
export const cancelOrder = async (
  orderId: number,
  userId: string // UUID string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Önce siparişin kullanıcıya ait olduğunu kontrol et
    const { data: orderCheck, error: checkError } = await supabase
      .from('orders')
      .select(`
        id, 
        status_id, 
        user
      `)
      .eq('id', orderId)
      .eq('user', userId)
      .single();

    if (checkError || !orderCheck) {
      return { success: false, message: 'Bu siparişi iptal etme yetkiniz yok veya sipariş bulunamadı.' };
    }

    // Sadece beklemede olan siparişler iptal edilebilir (status_id 1 = order_received, 2 = order_confirmed)
    if (![1, 2].includes(orderCheck.status_id as number)) {
      return { success: false, message: 'Bu sipariş artık iptal edilemez.' };
    }

    // Siparişi iptal et (order_cancelled status_id = 10)
    const { error } = await supabase
      .from('orders')
      .update({ status_id: 10 })
      .eq('id', orderId)
      .eq('user', userId);

    if (error) {
      console.error('Error cancelling order:', error);
      return { success: false, message: 'Sipariş iptal edilirken bir hata oluştu.' };
    }

    return { success: true, message: 'Sipariş başarıyla iptal edildi. Yeni sipariş verebilirsiniz.' };
  } catch (err) {
    console.error('Error in cancelOrder:', err);
    return { success: false, message: 'Sipariş iptal edilirken bir hata oluştu.' };
  }
};
