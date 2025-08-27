import { supabase } from './supabase';

// Veritabanından status bilgilerini cache'lemek için
let statusCache: any[] | null = null;

// Status tablosundan durumları çek
export const fetchOrderStatuses = async () => {
  if (statusCache) return statusCache;
  
  try {
    const { data, error } = await supabase
      .from('status')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    statusCache = data || [];
    return statusCache;
  } catch (error) {
    console.error('Error fetching order statuses:', error);
    return [];
  }
};

// Status name'e göre status bilgisini getir
export const getOrderStatus = (statusName: string) => {
  // Fallback için varsayılan değerler
  const defaultStatus = {
    id: 1,
    name: 'order_received',
    display_name: 'Sipariş Alındı',
    description: 'Siparişiniz alındı ve inceleniyor',
    color: '#3B82F6',
    icon: 'clock',
    order_index: 1,
    is_active: true
  };

  if (!statusCache) return defaultStatus;
  
  const status = statusCache.find(s => s.name === statusName);
  return status || defaultStatus;
};

// Status ID'ye göre status bilgisini getir
export const getOrderStatusById = (statusId: number) => {
  const defaultStatus = {
    id: 1,
    name: 'order_received',
    display_name: 'Sipariş Alındı',
    description: 'Siparişiniz alındı ve inceleniyor',
    color: '#3B82F6',
    icon: 'clock',
    order_index: 1,
    is_active: true
  };

  if (!statusCache) return defaultStatus;
  
  const status = statusCache.find(s => s.id === statusId);
  return status || defaultStatus;
};

// İptal edilebilir durumları kontrol et
export const canCancelOrder = (statusName: string): boolean => {
  const cancelableStatuses = ['order_received', 'order_confirmed'];
  return cancelableStatuses.includes(statusName);
};

// Status name'e göre CSS class'ı getir
export const getStatusColor = (statusName: string) => {
  const status = getOrderStatus(statusName);
  const colorMap: { [key: string]: string } = {
    '#3B82F6': 'bg-blue-100 text-blue-800',
    '#10B981': 'bg-green-100 text-green-800', 
    '#F59E0B': 'bg-yellow-100 text-yellow-800',
    '#EF4444': 'bg-red-100 text-red-800',
    '#8B5CF6': 'bg-purple-100 text-purple-800',
    '#F97316': 'bg-orange-100 text-orange-800',
    '#6366F1': 'bg-indigo-100 text-indigo-800',
  };
  
  return colorMap[status.color] || 'bg-gray-100 text-gray-800';
};

// Icon name'e göre icon component'i getir
export const getStatusIcon = (statusName: string) => {
  const status = getOrderStatus(statusName);
  return status.icon || 'clock';
};