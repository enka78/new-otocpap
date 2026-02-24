export const DEVICE_CATEGORY_IDS = new Set<number>([
  1, 3, 5, 7, 8, 9, 10, 11, 13, 14
]);

export function isDeviceCategory(categoryId: number): boolean {
  return DEVICE_CATEGORY_IDS.has(categoryId);
}