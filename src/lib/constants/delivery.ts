/**
 * Cihaz OLMAYAN kategorilerin ID listesi.
 * Sarf malzeme, maske ve aksesuar kategorileri bu listededir.
 * Bu listedeki kategoriler dışındaki tüm ürünler "Cihaz" olarak kabul edilir
 * (CPAP, BiPAP, ventilatör vb.).
 *
 * Cihaz olmayan kategoriler: 2, 4, 6, 12, 19
 */
export const NON_DEVICE_CATEGORY_IDS: readonly number[] = [2, 4, 6, 12, 19];

/**
 * Verilen categoryId'nin cihaz kategorisine ait olup olmadığını kontrol eder.
 */
export function isDeviceCategory(categoryId: number): boolean {
  return NON_DEVICE_CATEGORY_IDS.includes(categoryId);
}
