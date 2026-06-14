import { getPosnetConfig } from "@/lib/billing/posnet/config";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xmlTag(xml: string, tag: string) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

export async function postPosnetXml(body: string) {
  const { xmlUrl } = getPosnetConfig();
  const payload = `xmldata=${encodeURIComponent(body)}`;
  const res = await fetch(xmlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`POSNET_HTTP_${res.status}`);
  }
  return text;
}

export function parsePosnetResponse(xml: string) {
  return {
    approved: xmlTag(xml, "approved"),
    respCode: xmlTag(xml, "respCode"),
    respText: xmlTag(xml, "respText"),
    data1: xmlTag(xml, "data1"),
    data2: xmlTag(xml, "data2"),
    sign: xmlTag(xml, "sign"),
    mdStatus: xmlTag(xml, "mdStatus"),
    mdErrorMessage: xmlTag(xml, "mdErrorMessage"),
    bankData: xmlTag(xml, "bankData"),
    merchantData: xmlTag(xml, "merchantData"),
    hostlogkey: xmlTag(xml, "hostlogkey"),
    authCode: xmlTag(xml, "authCode"),
  };
}

export function buildOosRequestXml(input: {
  mid: string;
  tid: string;
  posnetId: string;
  xid: string;
  amountKurus: string;
  installment?: string;
}) {
  const installment = input.installment ?? "00";
  return `<?xml version="1.0" encoding="utf-8"?>
<posnetRequest>
  <mid>${escapeXml(input.mid)}</mid>
  <tid>${escapeXml(input.tid)}</tid>
  <oosRequestData>
    <posnetid>${escapeXml(input.posnetId)}</posnetid>
    <XID>${escapeXml(input.xid)}</XID>
    <amount>${escapeXml(input.amountKurus)}</amount>
    <currencyCode>TL</currencyCode>
    <installment>${escapeXml(installment)}</installment>
    <tranType>Sale</tranType>
    <cardHolderName></cardHolderName>
    <ccno></ccno>
    <expDate></expDate>
    <cvc></cvc>
  </oosRequestData>
</posnetRequest>`;
}

export function buildOosResolveXml(input: {
  mid: string;
  tid: string;
  bankPacket: string;
  merchantPacket: string;
  sign: string;
  mac: string;
}) {
  return `<?xml version="1.0" encoding="utf-8"?>
<posnetRequest>
  <mid>${escapeXml(input.mid)}</mid>
  <tid>${escapeXml(input.tid)}</tid>
  <oosResolveMerchantData>
    <bankData>${escapeXml(input.bankPacket)}</bankData>
    <merchantData>${escapeXml(input.merchantPacket)}</merchantData>
    <sign>${escapeXml(input.sign)}</sign>
    <mac>${escapeXml(input.mac)}</mac>
  </oosResolveMerchantData>
</posnetRequest>`;
}

export function buildOosTranXml(input: {
  mid: string;
  tid: string;
  bankData: string;
  mac: string;
}) {
  return `<?xml version="1.0" encoding="utf-8"?>
<posnetRequest>
  <mid>${escapeXml(input.mid)}</mid>
  <tid>${escapeXml(input.tid)}</tid>
  <oosTranData>
    <bankData>${escapeXml(input.bankData)}</bankData>
    <mac>${escapeXml(input.mac)}</mac>
  </oosTranData>
</posnetRequest>`;
}
