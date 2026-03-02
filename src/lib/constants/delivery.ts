export const DEVICE_CATEGORY_IDS = new Set<number>([
  1, 3, 5, 7, 8, 9, 10, 11, 13, 14
]);

export function isDeviceCategory(categoryId: number): boolean {
  return DEVICE_CATEGORY_IDS.has(categoryId);
}

/** Türkiye içi kargo ücreti (TL) — settings tablosu okunamazsa kullanılan fallback */
export const DEFAULT_DOMESTIC_CARGO_FEE = 200;

/** Bu tutarın üzerindeki siparişlerde kargo ücretsiz olur (TL) — settings tablosu okunamazsa kullanılan fallback */
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 3000;
