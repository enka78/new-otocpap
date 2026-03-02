import { supabase } from "@/lib/supabase";
import { DeliverySettings } from "@/types/settings";
import {
    DEFAULT_DOMESTIC_CARGO_FEE,
    DEFAULT_FREE_SHIPPING_THRESHOLD,
} from "@/lib/constants/delivery";

/**
 * Supabase settings tablosundan kargo ayarlarını okur.
 *
 * @returns Kargo ücreti ve ücretsiz kargo eşiği. Veri okunamazsa güvenli
 *          fallback sabitlerine (`DEFAULT_*`) döner.
 */
export async function getDeliverySettings(): Promise<DeliverySettings> {
    try {
        const { data, error } = await supabase
            .from("settings")
            .select("key, value")
            .in("key", ["domestic_cargo_fee", "free_shipping_threshold"]);

        if (error) {
            throw error;
        }

        const settingsMap = new Map(
            (data ?? []).map((row) => [row.key as string, row.value as string])
        );

        const domesticCargoFee = parseFloat(
            settingsMap.get("domestic_cargo_fee") ?? String(DEFAULT_DOMESTIC_CARGO_FEE)
        );
        const freeShippingThreshold = parseFloat(
            settingsMap.get("free_shipping_threshold") ??
            String(DEFAULT_FREE_SHIPPING_THRESHOLD)
        );

        return {
            domesticCargoFee: isNaN(domesticCargoFee)
                ? DEFAULT_DOMESTIC_CARGO_FEE
                : domesticCargoFee,
            freeShippingThreshold: isNaN(freeShippingThreshold)
                ? DEFAULT_FREE_SHIPPING_THRESHOLD
                : freeShippingThreshold,
        };
    } catch {
        // Hata durumunda hardcoded fallback değerler döndürülür; uygulama çalışmaya devam eder.
        return {
            domesticCargoFee: DEFAULT_DOMESTIC_CARGO_FEE,
            freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
        };
    }
}
