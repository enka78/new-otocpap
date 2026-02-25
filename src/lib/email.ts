/**
 * E-posta servisi (Resend)
 * Sipariş alındığında müşteriye onay maili,
 * info@otocpap.com'a yeni sipariş bildirimi gönderir.
 *
 * ⚠️  Domain doğrulama gereksinimi:
 *     resend.com/domains adresinde otocpap.com doğrulanmalıdır.
 *     Aksi hâlde "Domain not verified" hatası alınır.
 */

import { Resend } from "resend";
import {
    buildCustomerEmailHtml,
    buildAdminEmailHtml,
    type OrderEmailParams,
} from "./order-email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM ?? "OtoCPAP <info@otocpap.com>";
const EMAIL_ADMIN = process.env.EMAIL_ADMIN ?? "info@otocpap.com";

/**
 * Müşteriye "Siparişiniz alındı" onay e-postası gönderir.
 */
export async function sendOrderConfirmationToCustomer(
    params: OrderEmailParams
): Promise<void> {
    const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: params.customerEmail,
        subject: `Siparişiniz Alındı – #${params.orderNumber}`,
        html: buildCustomerEmailHtml(params),
    });

    if (error) {
        throw new Error(`[Resend] Müşteri maili gönderilemedi: ${JSON.stringify(error)}`);
    }

    console.info(`[Email] ✅ Müşteri onay maili gönderildi → ${params.customerEmail} (id: ${data?.id})`);
}

/**
 * Admin'e (info@otocpap.com) "Yeni sipariş geldi" bildirimi gönderir.
 */
export async function sendNewOrderNotificationToAdmin(
    params: OrderEmailParams
): Promise<void> {
    const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: EMAIL_ADMIN,
        subject: `🛒 Yeni Sipariş #${params.orderNumber} – ${params.customerName}`,
        html: buildAdminEmailHtml(params),
    });

    if (error) {
        throw new Error(`[Resend] Admin maili gönderilemedi: ${JSON.stringify(error)}`);
    }

    console.info(`[Email] ✅ Admin bildirim maili gönderildi → ${EMAIL_ADMIN} (id: ${data?.id})`);
}

/**
 * Her iki e-postayı birden paralel gönderir.
 * E-posta hatası siparişi engellemez (hata sadece loglanır).
 */
export async function sendOrderEmails(params: OrderEmailParams): Promise<void> {
    const results = await Promise.allSettled([
        sendOrderConfirmationToCustomer(params),
        sendNewOrderNotificationToAdmin(params),
    ]);

    const [customerResult, adminResult] = results;

    if (customerResult.status === "rejected") {
        console.error("[Email] ❌ Müşteri onay maili gönderilemedi:", customerResult.reason);
    }

    if (adminResult.status === "rejected") {
        console.error("[Email] ❌ Admin bildirim maili gönderilemedi:", adminResult.reason);
    }
}
