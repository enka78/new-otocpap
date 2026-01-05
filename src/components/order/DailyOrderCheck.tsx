"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { checkDailyOrderLimit, cancelOrder, DailyOrderCheck } from '@/lib/orderValidation';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface DailyOrderCheckProps {
  userId: string;
  onOrderStatusChange: (canOrder: boolean) => void;
}

export default function DailyOrderCheckComponent({ userId, onOrderStatusChange }: DailyOrderCheckProps) {
  const [orderCheck, setOrderCheck] = useState<DailyOrderCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    if (userId) {
      checkUserOrders();
    }
  }, [userId]);

  const checkUserOrders = async () => {
    setLoading(true);
    const result = await checkDailyOrderLimit(userId);
    setOrderCheck(result);
    onOrderStatusChange(result.canOrder);
    setLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!orderCheck?.existingOrder) return;

    setCancelling(true);
    const result = await cancelOrder(orderCheck.existingOrder.id, userId);

    if (result.success) {
      // Sipariş durumunu yeniden kontrol et
      await checkUserOrders();
    } else {
      alert(result.message);
    }
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
          <span className="text-blue-800">{t('dailyOrder.checkingStatus')}</span>
        </div>
      </div>
    );
  }


  if (!orderCheck) return null;

  // Sipariş verilebilir durumda - hiçbir şey gösterme
  if (orderCheck.canOrder) {
    return null;
  }

  // Mevcut sipariş var
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            {t('dailyOrder.limitTitle')}
          </h3>
          <p className="text-yellow-700 mb-4">
            {orderCheck.message}
          </p>

          {orderCheck.existingOrder && (
            <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200">
              <h4 className="font-medium text-gray-900 mb-2">{t('dailyOrder.existingOrder')}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('dailyOrder.orderNumber')}</span>
                  <span className="ml-2 font-medium">#{orderCheck.existingOrder.order_number || orderCheck.existingOrder.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('dailyOrder.status')}</span>
                  <span className="ml-2 font-medium capitalize">{orderCheck.existingOrder.status}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('dailyOrder.amount')}</span>
                  <span className="ml-2 font-medium">{formatCurrency(orderCheck.existingOrder.total_amount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('dailyOrder.date')}</span>
                  <span className="ml-2 font-medium">
                    {new Date(orderCheck.existingOrder.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle size={16} className="mr-2" />
              {cancelling ? t('dailyOrder.cancelling') : t('dailyOrder.cancelOrder')}
            </button>
            <p className="text-sm text-yellow-600">
              {t('dailyOrder.cancelNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}