export type PosnetConfig = {
  mid: string;
  tid: string;
  posnetId: string;
  encKey: string;
  testMode: boolean;
  xmlUrl: string;
  gatewayUrl: string;
};

export function isPosnetConfigured() {
  return Boolean(
    process.env.POSNET_MID &&
      process.env.POSNET_TID &&
      process.env.POSNET_ID &&
      process.env.POSNET_ENC_KEY,
  );
}

export function getPosnetConfig(): PosnetConfig {
  const mid = process.env.POSNET_MID;
  const tid = process.env.POSNET_TID;
  const posnetId = process.env.POSNET_ID;
  const encKey = process.env.POSNET_ENC_KEY;
  if (!mid || !tid || !posnetId || !encKey) {
    throw new Error("POSNET_NOT_CONFIGURED");
  }

  const testMode = process.env.POSNET_TEST_MODE === "true";

  return {
    mid,
    tid,
    posnetId,
    encKey,
    testMode,
    xmlUrl: testMode
      ? "https://setmpos.ykb.com/PosnetWebService/XML"
      : "https://posnet.yapikredi.com.tr/PosnetWebService/XML",
    gatewayUrl: testMode
      ? "https://setmpos.ykb.com/3DSWebService/YKBPaymentService"
      : "https://posnet.yapikredi.com.tr/3DSWebService/YKBPaymentService",
  };
}

export function getAppBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
