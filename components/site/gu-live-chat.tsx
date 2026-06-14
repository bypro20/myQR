/** Gu Live Chat embed — panel snippet ile birebir uyumlu sabitler */
export const GU_LIVECHAT_BASE = "https://www.gulivechat.com";
export const GU_LIVECHAT_VERSION = "2026.06.15a";
export const GU_LIVECHAT_WEBSITE_ID =
  process.env.NEXT_PUBLIC_GU_LIVECHAT_WEBSITE_ID ?? "tq7mpR888X9QUtbnh5V7aHQV";

/** Root layout <head> içinde — Next Script/hydration bağımlılığı yok */
export function guLiveChatHeadScripts() {
  const websiteId = GU_LIVECHAT_WEBSITE_ID;
  if (!websiteId) return null;

  const initScript = `(function(){window.$gu=window.$gu||function(){(window.$gu.q=window.$gu.q||[]).push(arguments)};window.GU_WIDGET_URL=${JSON.stringify(GU_LIVECHAT_BASE)};$gu("set","WEBSITE_ID",${JSON.stringify(websiteId)});if(!document.getElementById("gu-widget-loader-external")){var s=document.createElement("script");s.id="gu-widget-loader-external";s.async=true;s.src=${JSON.stringify(`${GU_LIVECHAT_BASE}/widget.js?v=${GU_LIVECHAT_VERSION}`)};(document.head||document.documentElement).appendChild(s);}})();`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: initScript }} />
      <link rel="preconnect" href={GU_LIVECHAT_BASE} />
      <link rel="dns-prefetch" href={GU_LIVECHAT_BASE} />
    </>
  );
}

/** Panelde müşteriye gösterilen ham embed */
export function buildGuLiveChatSnippet(websiteId: string = GU_LIVECHAT_WEBSITE_ID) {
  return `<!-- Gu Live Chat — bu WEBSITE_ID yalnızca sizin panelinize bağlıdır -->
<script>
  window.$gu = window.$gu || function() {
    (window.$gu.q = window.$gu.q || []).push(arguments);
  };
  window.GU_WIDGET_URL = '${GU_LIVECHAT_BASE}';
  $gu('set', 'WEBSITE_ID', '${websiteId}');
</script>
<script async src="${GU_LIVECHAT_BASE}/widget.js?v=${GU_LIVECHAT_VERSION}"></script>`;
}
