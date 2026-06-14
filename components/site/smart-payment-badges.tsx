import { isCardPaymentEnabled } from "@/lib/billing/payment-config";
import { PaymentBadges } from "@/components/site/payment-badges";

type Props = {
  className?: string;
  variant?: "footer" | "checkout";
  size?: "sm" | "md";
};

/** Sunucu tarafında ödeme yapılandırmasına göre doğru rozetleri gösterir */
export function SmartPaymentBadges(props: Props) {
  return <PaymentBadges showCard={isCardPaymentEnabled()} {...props} />;
}
