'use client';

import { useCart } from '@/contexts/CartContext';
import Toast from './Toast';

export default function GlobalToast() {
  const { toast, setToast } = useCart();

  if (!toast) return null;

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={!!toast}
      onClose={() => setToast(null)}
    />
  );
}