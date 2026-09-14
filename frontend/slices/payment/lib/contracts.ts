export type PaymentCustomer = {
  name: string;
  email: string;
  phone?: string;
};

export interface PaymentInstructions {
  vaNumber?: string;
  howToPayUrl?: string;
  qrString?: string;
  qrImageUrl?: string;
  deeplink?: string;
  webUrl?: string;
  paymentUrl?: string;
}

export interface DokuCheckoutInput {
  orderId: string;
  amount: number;
  customer: PaymentCustomer;
  callbackUrl?: string;
  paymentMethods?: string[];
}

export type DokuCheckoutResult =
  | {
      ok?: true;
      checkoutUrl: string;
      token?: string;
      expiresAt?: number;
    }
  | {
      ok: false;
      notice: string;
    };

export interface DokuDirectInput {
  orderId?: string;
  amount: number;
  channel: string;
  customer: PaymentCustomer;
}

export type DokuDirectResult =
  | {
      ok?: true;
      orderId?: string;
      instructions: PaymentInstructions;
      expiresAt?: number;
    }
  | {
      ok: false;
      notice: string;
      orderId?: string;
    };

export type DokuStatus =
  | "pending"
  | "client_claimed"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";

export type MidtransCustomer = {
  first_name: string;
  email: string;
  phone?: string;
};

export type MidtransCheckoutInput = {
  amount: number;
  orderId: string;
  customer?: MidtransCustomer;
};

export type MidtransCheckoutResult = {
  token: string;
  redirectUrl?: string;
};

export type PaymentOrderSummary = {
  orderId: string;
  amount: number;
  provider: "doku" | "midtrans" | "stripe";
  status: DokuStatus;
  createdAt?: number;
};
