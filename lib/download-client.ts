/** Sync download — must run inside click handler before any await (browser user-gesture rule). */
export function triggerDirectDownload(url: string, fileName: string) {
  const a = document.createElement("a");
  a.href = `${url}${url.includes("?") ? "&" : "?"}_t=${Date.now()}`;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadFromResponse(res: Response, fallbackName: string) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "İndirme başarısız." }));
    throw new Error(typeof err.error === "string" ? err.error : "İndirme başarısız.");
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  triggerBlobDownload(blob, match?.[1] || fallbackName);
}
