"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Copy, Check, AlertCircle } from "lucide-react";
import {
  PaymentMethod,
  PaymentStep,
  CardData,
  InstallmentOption,
  PaymentStatus,
} from "@/types/payment";

interface PaymentScreenProps {
  orderId: number;
  amount: number;
  currency: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export default function PaymentScreen({
  orderId,
  amount,
  currency,
  onSuccess,
  onError,
  onBack,
}: PaymentScreenProps) {
  const t = useTranslations();
  const [currentStep, setCurrentStep] = useState<PaymentStep>(
    PaymentStep.PAYMENT_METHOD
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Taksit Seçenekleri
  const installmentOptions: InstallmentOption[] = [
    {
      count: 1,
      label: t("payment.installment.option1"),
      monthly_amount: amount,
      total_amount: amount,
    },
    {
      count: 2,
      label: t("payment.installment.option2"),
      monthly_amount: amount / 2,
      total_amount: amount,
    },
    {
      count: 3,
      label: t("payment.installment.option3"),
      monthly_amount: amount / 3,
      total_amount: amount,
    },
    {
      count: 6,
      label: t("payment.installment.option6"),
      monthly_amount: amount / 6,
      total_amount: amount * 1.01,
    },
    {
      count: 9,
      label: t("payment.installment.option9"),
      monthly_amount: amount / 9,
      total_amount: amount * 1.02,
    },
    {
      count: 12,
      label: t("payment.installment.option12"),
      monthly_amount: amount / 12,
      total_amount: amount * 1.03,
    },
  ];

  const [cardData, setCardData] = useState<CardData>({
    card_number: "",
    card_holder_name: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Kart numarası formatı
    if (name === "card_number") {
      const formatted = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      setCardData({ ...cardData, [name]: formatted.slice(0, 19) });
      return;
    }

    // Tarih formatı
    if (name === "expiry_month") {
      const numValue = value.replace(/\D/g, "").slice(0, 2);
      setCardData({ ...cardData, [name]: numValue });
      return;
    }

    if (name === "expiry_year") {
      const numValue = value.replace(/\D/g, "").slice(0, 2);
      setCardData({ ...cardData, [name]: numValue });
      return;
    }

    // CVV formatı
    if (name === "cvv") {
      const numValue = value.replace(/\D/g, "").slice(0, 4);
      setCardData({ ...cardData, [name]: numValue });
      return;
    }

    setCardData({ ...cardData, [name]: value });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);

    if (
      method === PaymentMethod.CREDIT_CARD ||
      method === PaymentMethod.DEBIT_CARD
    ) {
      setCurrentStep(PaymentStep.CARD_DETAILS);
    } else if (method === PaymentMethod.INSTALLMENT) {
      setCurrentStep(PaymentStep.INSTALLMENT);
    } else {
      setCurrentStep(PaymentStep.CONFIRMATION);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basit validasyon
    if (!cardData.card_number.replace(/\s/g, "").match(/^\d{16}$/)) {
      setErrorMessage(t("payment.errors.invalidCardNumber"));
      return;
    }

    if (!cardData.card_holder_name.trim()) {
      setErrorMessage(t("payment.errors.cardHolderRequired"));
      return;
    }

    if (!cardData.expiry_month || !cardData.expiry_year) {
      setErrorMessage(t("payment.errors.expiryRequired"));
      return;
    }

    if (!cardData.cvv.match(/^\d{3,4}$/)) {
      setErrorMessage(t("payment.errors.invalidCvv"));
      return;
    }

    setCurrentStep(PaymentStep.CONFIRMATION);
    setErrorMessage("");
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          amount,
          currency,
          payment_method: selectedPaymentMethod,
          card_data:
            selectedPaymentMethod === PaymentMethod.CREDIT_CARD
              ? cardData
              : undefined,
          installment_count:
            selectedPaymentMethod === PaymentMethod.INSTALLMENT
              ? selectedInstallment
              : 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("payment.errors.paymentFailed"));
      }

      setTransactionId(data.transaction_id);
      setPaymentStatus(PaymentStatus.COMPLETED);
      setCurrentStep(PaymentStep.RESULT);

      // Başarılı ödemeyi bildir
      setTimeout(() => {
        onSuccess(data.transaction_id);
      }, 2000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : t("payment.errors.unknown");
      setErrorMessage(errorMsg);
      setPaymentStatus(PaymentStatus.FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Başlık */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("payment.title")}
        </h2>
        <div className="mt-2 text-sm text-gray-600">
          <p>
            {t("payment.amount")}: {amount.toLocaleString("tr-TR")} {currency}
          </p>
        </div>
      </div>

      {/* Hata Mesajı */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle
            className="text-red-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <h3 className="font-semibold text-red-900">
              {t("payment.errors.title")}
            </h3>
            <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Ödeme Yöntemi Seçimi */}
      {currentStep === PaymentStep.PAYMENT_METHOD && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            {t("payment.selectMethod")}
          </h3>

          {/* Kredi Kartı */}
          <button
            onClick={() => handlePaymentMethodSelect(PaymentMethod.CREDIT_CARD)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <CreditCard size={24} className="text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">
                  {t("payment.method.creditCard")}
                </p>
                <p className="text-sm text-gray-600">
                  {t("payment.method.creditCardDesc")}
                </p>
              </div>
            </div>
          </button>

          {/* Taksit */}
          <button
            onClick={() => handlePaymentMethodSelect(PaymentMethod.INSTALLMENT)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <CreditCard size={24} className="text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">
                  {t("payment.method.installment")}
                </p>
                <p className="text-sm text-gray-600">
                  {t("payment.method.installmentDesc")}
                </p>
              </div>
            </div>
          </button>

          {/* Bank Transferi */}
          <button
            onClick={() =>
              handlePaymentMethodSelect(PaymentMethod.BANK_TRANSFER)
            }
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <CreditCard size={24} className="text-purple-600" />
              <div>
                <p className="font-semibold text-gray-900">
                  {t("payment.method.bankTransfer")}
                </p>
                <p className="text-sm text-gray-600">
                  {t("payment.method.bankTransferDesc")}
                </p>
              </div>
            </div>
          </button>

          {/* WhatsApp (Mevcut Yöntem) */}
          <button
            onClick={() => handlePaymentMethodSelect(PaymentMethod.WHATSAPP)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <CreditCard size={24} className="text-green-500" />
              <div>
                <p className="font-semibold text-gray-900">
                  {t("payment.method.whatsapp")}
                </p>
                <p className="text-sm text-gray-600">
                  {t("payment.method.whatsappDesc")}
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Kart Detayları */}
      {currentStep === PaymentStep.CARD_DETAILS && (
        <form onSubmit={handleCardSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("payment.card.cardNumber")} *
            </label>
            <input
              type="text"
              name="card_number"
              value={cardData.card_number}
              onChange={handleCardInputChange}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("payment.card.holderName")} *
            </label>
            <input
              type="text"
              name="card_holder_name"
              value={cardData.card_holder_name}
              onChange={handleCardInputChange}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("payment.card.month")} *
              </label>
              <input
                type="text"
                name="expiry_month"
                value={cardData.expiry_month}
                onChange={handleCardInputChange}
                placeholder="MM"
                maxLength={2}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("payment.card.year")} *
              </label>
              <input
                type="text"
                name="expiry_year"
                value={cardData.expiry_year}
                onChange={handleCardInputChange}
                placeholder="YY"
                maxLength={2}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("payment.card.cvv")} *
              </label>
              <input
                type="text"
                name="cvv"
                value={cardData.cvv}
                onChange={handleCardInputChange}
                placeholder="CVV"
                maxLength={4}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(PaymentStep.PAYMENT_METHOD)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              {t("payment.back")}
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("payment.next")}
            </button>
          </div>
        </form>
      )}

      {/* Taksit Seçimi */}
      {currentStep === PaymentStep.INSTALLMENT && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            {t("payment.selectInstallment")}
          </h3>

          <div className="space-y-3">
            {installmentOptions.map((option) => (
              <button
                key={option.count}
                onClick={() => setSelectedInstallment(option.count)}
                className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                  selectedInstallment === option.count
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("payment.monthlyAmount")}:{" "}
                      {option.monthly_amount.toLocaleString("tr-TR")} {currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {option.total_amount.toLocaleString("tr-TR")} {currency}
                    </p>
                    {option.fee_percentage && (
                      <p className="text-sm text-gray-600">
                        +{option.fee_percentage}% {t("payment.fee")}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(PaymentStep.PAYMENT_METHOD)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              {t("payment.back")}
            </button>
            <button
              onClick={() => setCurrentStep(PaymentStep.CONFIRMATION)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("payment.next")}
            </button>
          </div>
        </div>
      )}

      {/* Onay Ekranı */}
      {currentStep === PaymentStep.CONFIRMATION && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">
                {t("payment.paymentMethod")}:
              </span>
              <span className="font-semibold text-gray-900">
                {selectedPaymentMethod === PaymentMethod.CREDIT_CARD &&
                  t("payment.method.creditCard")}
                {selectedPaymentMethod === PaymentMethod.INSTALLMENT &&
                  `${t(
                    "payment.method.installment"
                  )} (${selectedInstallment}x)`}
                {selectedPaymentMethod === PaymentMethod.BANK_TRANSFER &&
                  t("payment.method.bankTransfer")}
                {selectedPaymentMethod === PaymentMethod.WHATSAPP &&
                  t("payment.method.whatsapp")}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-700 font-semibold">
                {t("payment.totalAmount")}:
              </span>
              <span className="text-lg font-bold text-blue-600">
                {amount.toLocaleString("tr-TR")} {currency}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(PaymentStep.PAYMENT_METHOD)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              {t("payment.cancel")}
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 transition-colors"
            >
              {loading ? t("payment.processing") : t("payment.pay")}
            </button>
          </div>
        </div>
      )}

      {/* Sonuç Ekranı */}
      {currentStep === PaymentStep.RESULT && (
        <div className="space-y-6 text-center">
          {paymentStatus === PaymentStatus.COMPLETED ? (
            <>
              <div className="text-6xl text-green-600">✓</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("payment.success")}
                </h3>
                <p className="text-gray-600">{t("payment.successMessage")}</p>
              </div>
              {transactionId && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {t("payment.transactionId")}:
                  </p>
                  <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                    <code className="text-sm font-mono text-gray-900">
                      {transactionId}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(transactionId, "transaction")
                      }
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {copiedField === "transaction" ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-6xl text-red-600">✕</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("payment.failed")}
                </h3>
                <p className="text-gray-600">{t("payment.failedMessage")}</p>
              </div>
              <button
                onClick={() => setCurrentStep(PaymentStep.PAYMENT_METHOD)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t("payment.tryAgain")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
