/**
 * HTML e-posta şablonları
 * Müşteri onay maili ve admin bildirim maili için ayrı şablonlar.
 */

export interface OrderEmailParams {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryType: string;
    address: string;
    city: string;
    district: string;
    country: string;
    totalAmount: string;
    paymentMethod: string;
    products: Array<{
        name: string;
        quantity: number;
        price: string;
    }>;
    notes?: string;
}

const BRAND_COLOR = "#1a6fb8";
const BRAND_NAME = "OtoCPAP – Dönüşüm Medikal";
const BRAND_SITE = "https://www.otocpap.com";

const DELIVERY_TYPE_LABELS: Record<string, string> = {
    "istanbul-installation": "İstanbul İçi Yerinde Kurulum",
    "domestic-cargo": "Türkiye İçi Kargo",
    "international-cargo": "Yurt Dışı Kargo",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    credit_card: "Kredi Kartı (PayTR)",
    bank_transfer: "Havale / EFT",
};

function getDeliveryLabel(deliveryType: string): string {
    return DELIVERY_TYPE_LABELS[deliveryType] ?? deliveryType;
}

function getPaymentLabel(paymentMethod: string): string {
    return PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod;
}

function buildProductRows(products: OrderEmailParams["products"]): string {
    return products
        .map(
            (p) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${p.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${p.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${p.price} ₺</td>
        </tr>
      `
        )
        .join("");
}

/** Müşteriye gönderilecek "Siparişiniz alındı" e-postası */
export function buildCustomerEmailHtml(params: OrderEmailParams): string {
    const {
        orderNumber,
        customerName,
        deliveryType,
        address,
        city,
        district,
        country,
        totalAmount,
        paymentMethod,
        products,
        notes,
    } = params;

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Siparişiniz Alındı</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Başlık -->
          <tr>
            <td style="background:${BRAND_COLOR};padding:28px 32px;">
              <p style="margin:0;font-size:22px;color:#fff;font-weight:bold;">${BRAND_NAME}</p>
              <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Sipariş Onayı</p>
            </td>
          </tr>

          <!-- İçerik -->
          <tr>
            <td style="padding:32px;">
              <p style="font-size:18px;font-weight:bold;margin:0 0 8px;">Sayın ${customerName},</p>
              <p style="margin:0 0 24px;color:#555;line-height:1.6;">
                Siparişiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.
              </p>

              <!-- Sipariş Numarası -->
              <div style="background:#f0f7ff;border-left:4px solid ${BRAND_COLOR};padding:14px 18px;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#666;">Sipariş Numarası</p>
                <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:${BRAND_COLOR};">#${orderNumber}</p>
              </div>

              <!-- Ürünler -->
              <p style="font-weight:bold;margin:0 0 10px;">Sipariş Edilen Ürünler</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin-bottom:24px;">
                <thead>
                  <tr style="background:#f8f8f8;">
                    <th style="padding:10px 12px;text-align:left;font-size:13px;font-weight:600;">Ürün</th>
                    <th style="padding:10px 12px;text-align:center;font-size:13px;font-weight:600;">Adet</th>
                    <th style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600;">Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildProductRows(products)}
                  <tr>
                    <td colspan="2" style="padding:10px 12px;font-weight:bold;text-align:right;">Toplam</td>
                    <td style="padding:10px 12px;font-weight:bold;text-align:right;color:${BRAND_COLOR};">${totalAmount} ₺</td>
                  </tr>
                </tbody>
              </table>

              <!-- Teslimat ve Ödeme Bilgisi -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-right:8px;">
                    <div style="background:#f8f8f8;padding:14px;border-radius:6px;">
                      <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;">Teslimat</p>
                      <p style="margin:0;font-size:14px;font-weight:600;">${getDeliveryLabel(deliveryType)}</p>
                      <p style="margin:4px 0 0;font-size:13px;color:#555;">${address}, ${district}, ${city}, ${country}</p>
                    </div>
                  </td>
                  <td width="50%" style="vertical-align:top;padding-left:8px;">
                    <div style="background:#f8f8f8;padding:14px;border-radius:6px;">
                      <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;">Ödeme</p>
                      <p style="margin:0;font-size:14px;font-weight:600;">${getPaymentLabel(paymentMethod)}</p>
                    </div>
                  </td>
                </tr>
              </table>

              ${notes
            ? `<div style="background:#fffbf0;border-left:4px solid #f0a500;padding:12px 16px;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0 0 4px;font-size:12px;color:#888;">Sipariş Notu</p>
                <p style="margin:0;font-size:14px;color:#555;">${notes}</p>
              </div>`
            : ""
        }

              <p style="color:#666;font-size:14px;line-height:1.6;">
                Sorularınız için <a href="mailto:info@otocpap.com" style="color:${BRAND_COLOR};">info@otocpap.com</a> adresinden veya telefon ile ulaşabilirsiniz.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                © 2025 ${BRAND_NAME} •
                <a href="${BRAND_SITE}" style="color:${BRAND_COLOR};text-decoration:none;">otocpap.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** info@otocpap.com'a gönderilecek "Yeni sipariş geldi" e-postası */
export function buildAdminEmailHtml(params: OrderEmailParams): string {
    const {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        deliveryType,
        address,
        city,
        district,
        country,
        totalAmount,
        paymentMethod,
        products,
        notes,
    } = params;

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Yeni Sipariş Bildirimi</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Başlık -->
          <tr>
            <td style="background:#e05c00;padding:28px 32px;">
              <p style="margin:0;font-size:22px;color:#fff;font-weight:bold;">🛒 Yeni Sipariş Geldi!</p>
              <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">${BRAND_NAME} Admin Bildirimi</p>
            </td>
          </tr>

          <!-- İçerik -->
          <tr>
            <td style="padding:32px;">

              <!-- Sipariş Numarası + Ödeme -->
              <div style="background:#fff3eb;border-left:4px solid #e05c00;padding:14px 18px;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#666;">Sipariş Numarası</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#e05c00;">#${orderNumber}</p>
                <p style="margin:8px 0 0;font-size:13px;"><strong>Ödeme:</strong> ${getPaymentLabel(paymentMethod)}</p>
              </div>

              <!-- Müşteri Bilgileri -->
              <p style="font-weight:bold;margin:0 0 10px;">Müşteri Bilgileri</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin-bottom:24px;">
                <tr style="background:#f8f8f8;">
                  <td style="padding:10px 14px;font-size:13px;color:#888;width:40%;">Ad Soyad</td>
                  <td style="padding:10px 14px;font-size:14px;font-weight:600;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;font-size:13px;color:#888;border-top:1px solid #f0f0f0;">E-posta</td>
                  <td style="padding:10px 14px;font-size:14px;border-top:1px solid #f0f0f0;">
                    <a href="mailto:${customerEmail}" style="color:${BRAND_COLOR};text-decoration:none;">${customerEmail}</a>
                  </td>
                </tr>
                <tr style="background:#f8f8f8;">
                  <td style="padding:10px 14px;font-size:13px;color:#888;border-top:1px solid #f0f0f0;">Telefon</td>
                  <td style="padding:10px 14px;font-size:14px;border-top:1px solid #f0f0f0;">
                    <a href="tel:${customerPhone}" style="color:${BRAND_COLOR};text-decoration:none;">${customerPhone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;font-size:13px;color:#888;border-top:1px solid #f0f0f0;">Teslimat</td>
                  <td style="padding:10px 14px;font-size:14px;border-top:1px solid #f0f0f0;">${getDeliveryLabel(deliveryType)}</td>
                </tr>
                <tr style="background:#f8f8f8;">
                  <td style="padding:10px 14px;font-size:13px;color:#888;border-top:1px solid #f0f0f0;">Adres</td>
                  <td style="padding:10px 14px;font-size:14px;border-top:1px solid #f0f0f0;">${address}, ${district}, ${city}, ${country}</td>
                </tr>
              </table>

              <!-- Ürünler -->
              <p style="font-weight:bold;margin:0 0 10px;">Siparişin İçeriği</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin-bottom:24px;">
                <thead>
                  <tr style="background:#f8f8f8;">
                    <th style="padding:10px 12px;text-align:left;font-size:13px;font-weight:600;">Ürün</th>
                    <th style="padding:10px 12px;text-align:center;font-size:13px;font-weight:600;">Adet</th>
                    <th style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600;">Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildProductRows(products)}
                  <tr style="background:#fff3eb;">
                    <td colspan="2" style="padding:10px 12px;font-weight:bold;text-align:right;">TOPLAM</td>
                    <td style="padding:10px 12px;font-weight:bold;text-align:right;color:#e05c00;font-size:16px;">${totalAmount} ₺</td>
                  </tr>
                </tbody>
              </table>

              ${notes
            ? `<div style="background:#fffbf0;border-left:4px solid #f0a500;padding:12px 16px;border-radius:4px;margin-bottom:16px;">
                <p style="margin:0 0 4px;font-size:12px;color:#888;">Müşteri Notu</p>
                <p style="margin:0;font-size:14px;color:#555;">${notes}</p>
              </div>`
            : ""
        }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                Bu e-posta otomatik olarak oluşturulmuştur • ${BRAND_NAME}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
