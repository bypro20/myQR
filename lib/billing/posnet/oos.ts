import { getAppBaseUrl, getPosnetConfig } from "@/lib/billing/posnet/config";
import { amountToKurus, posnetFirstHash, posnetMac, posnetXidFromOrderId } from "@/lib/billing/posnet/crypto";
import {
  buildOosRequestXml,
  buildOosResolveXml,
  buildOosTranXml,
  parsePosnetResponse,
  postPosnetXml,
} from "@/lib/billing/posnet/xml-client";

export type PosnetCheckoutSession = {
  gatewayUrl: string;
  fields: Record<string, string>;
  xid: string;
  amountKurus: string;
};

export type PosnetCompleteResult = {
  approved: boolean;
  respCode: string | null;
  respText: string | null;
  hostlogkey: string | null;
  authCode: string | null;
};

export function buildPosnetOrderMeta(orderId: string, amountTry: number) {
  const xid = posnetXidFromOrderId(orderId);
  return {
    posnetXid: xid,
    amountKurus: amountToKurus(amountTry),
    currency: "TL",
    provider: "yapikredi_posnet_oos",
  };
}

export async function createPosnetCheckoutSession(
  orderId: string,
  amountTry: number,
): Promise<PosnetCheckoutSession> {
  const cfg = getPosnetConfig();
  const xid = posnetXidFromOrderId(orderId);
  const amountKurus = amountToKurus(amountTry);
  const returnUrl = `${getAppBaseUrl()}/api/billing/posnet/callback`;

  const requestXml = buildOosRequestXml({
    mid: cfg.mid,
    tid: cfg.tid,
    posnetId: cfg.posnetId,
    xid,
    amountKurus,
  });

  const responseXml = await postPosnetXml(requestXml);
  const parsed = parsePosnetResponse(responseXml);

  if (parsed.approved !== "1" || !parsed.data1 || !parsed.data2 || !parsed.sign) {
    throw new Error(parsed.respText || parsed.respCode || "POSNET_OOS_REQUEST_FAILED");
  }

  return {
    gatewayUrl: cfg.gatewayUrl,
    xid,
    amountKurus,
    fields: {
      mid: cfg.mid,
      posnetID: cfg.posnetId,
      posnetData: parsed.data1,
      posnetData2: parsed.data2,
      digest: parsed.sign,
      merchantReturnURL: returnUrl,
      lang: "tr",
      url: "",
    },
  };
}

export async function finalizePosnetPayment(input: {
  xid: string;
  amountKurus: string;
  bankPacket: string;
  merchantPacket: string;
  sign: string;
}): Promise<PosnetCompleteResult> {
  const cfg = getPosnetConfig();
  const firstHash = posnetFirstHash(cfg.encKey, cfg.tid);
  const mac = posnetMac(input.xid, input.amountKurus, "TL", cfg.mid, firstHash);

  const resolveXml = buildOosResolveXml({
    mid: cfg.mid,
    tid: cfg.tid,
    bankPacket: input.bankPacket,
    merchantPacket: input.merchantPacket,
    sign: input.sign,
    mac,
  });

  const resolveResponse = await postPosnetXml(resolveXml);
  const resolved = parsePosnetResponse(resolveResponse);

  if (resolved.approved !== "1" || resolved.mdStatus !== "1" || !resolved.bankData) {
    return {
      approved: false,
      respCode: resolved.respCode,
      respText: resolved.respText || resolved.mdErrorMessage,
      hostlogkey: null,
      authCode: null,
    };
  }

  const tranXml = buildOosTranXml({
    mid: cfg.mid,
    tid: cfg.tid,
    bankData: resolved.bankData,
    mac,
  });

  const tranResponse = await postPosnetXml(tranXml);
  const tran = parsePosnetResponse(tranResponse);

  return {
    approved: tran.approved === "1",
    respCode: tran.respCode,
    respText: tran.respText,
    hostlogkey: tran.hostlogkey,
    authCode: tran.authCode,
  };
}
