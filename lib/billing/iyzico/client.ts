import { createHmac, randomBytes } from "crypto";

export type IyzicoConfig = {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
};

export function isIyzicoConfigured() {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

export function getIyzicoConfig(): IyzicoConfig {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!apiKey || !secretKey) throw new Error("IYZICO_NOT_CONFIGURED");

  const sandbox = process.env.IYZICO_SANDBOX === "true";
  return {
    apiKey,
    secretKey,
    baseUrl: sandbox ? "https://sandbox-api.iyzipay.com" : "https://api.iyzipay.com",
  };
}

function buildAuthorization(apiKey: string, secretKey: string, uriPath: string, body: string) {
  const randomKey = randomBytes(16).toString("hex");
  const payload = randomKey + uriPath + body;
  const signature = createHmac("sha256", secretKey).update(payload, "utf8").digest("hex");
  const token = Buffer.from(`apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`).toString("base64");
  return `IYZWSv2 ${token}`;
}

export async function iyzicoRequest<T>(uriPath: string, body: Record<string, unknown>): Promise<T> {
  const cfg = getIyzicoConfig();
  const json = JSON.stringify(body);
  const res = await fetch(`${cfg.baseUrl}${uriPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: buildAuthorization(cfg.apiKey, cfg.secretKey, uriPath, json),
    },
    body: json,
  });
  const data = (await res.json()) as T & { status?: string; errorMessage?: string };
  if (!res.ok) {
    throw new Error((data as { errorMessage?: string }).errorMessage || `IYZICO_${res.status}`);
  }
  return data;
}

export function formatIyzicoPrice(amountTry: number) {
  return amountTry.toFixed(2);
}

export type CheckoutInitResult = {
  token: string;
  paymentPageUrl: string;
};

export async function initializeIyzicoCheckout(input: {
  orderId: string;
  packageId: string;
  packageName: string;
  amountTry: number;
  buyerEmail: string;
  buyerName: string;
  buyerPhone?: string;
  callbackUrl: string;
}): Promise<CheckoutInitResult> {
  const price = formatIyzicoPrice(input.amountTry);
  const nameParts = input.buyerName.trim().split(/\s+/);
  const name = nameParts[0] || "Musteri";
  const surname = nameParts.slice(1).join(" ") || "Kullanici";

  const body = {
    locale: "tr",
    conversationId: input.orderId,
    price,
    paidPrice: price,
    currency: "TRY",
    basketId: input.orderId,
    paymentGroup: "PRODUCT",
    callbackUrl: input.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9, 12],
    buyer: {
      id: input.buyerEmail.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32) || input.orderId.slice(0, 32),
      name,
      surname,
      gsmNumber: input.buyerPhone || "+905555555555",
      email: input.buyerEmail,
      identityNumber: "11111111111",
      registrationAddress: "Turkiye",
      ip: "85.34.78.112",
      city: "Istanbul",
      country: "Turkey",
      zipCode: "34000",
    },
    shippingAddress: {
      contactName: input.buyerName,
      city: "Istanbul",
      country: "Turkey",
      address: "Turkiye",
      zipCode: "34000",
    },
    billingAddress: {
      contactName: input.buyerName,
      city: "Istanbul",
      country: "Turkey",
      address: "Turkiye",
      zipCode: "34000",
    },
    basketItems: [
      {
        id: input.packageId,
        name: input.packageName,
        category1: "Dijital",
        itemType: "VIRTUAL",
        price,
      },
    ],
  };

  const res = await iyzicoRequest<{
    status: string;
    token?: string;
    paymentPageUrl?: string;
    errorMessage?: string;
  }>("/payment/iyzipos/checkoutform/initialize/auth/ecom", body);

  if (res.status !== "success" || !res.token || !res.paymentPageUrl) {
    throw new Error(res.errorMessage || "IYZICO_INIT_FAILED");
  }

  return { token: res.token, paymentPageUrl: res.paymentPageUrl };
}

export async function retrieveIyzicoCheckout(token: string) {
  return iyzicoRequest<{
    status: string;
    paymentStatus?: string;
    paymentId?: string;
    errorMessage?: string;
  }>("/payment/iyzipos/checkoutform/auth/ecom/detail", {
    locale: "tr",
    token,
  });
}
