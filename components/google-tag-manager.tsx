/**
 * Google Tag Manager container for aipatentregister.com. Marketing manages the
 * tags inside it (Meta Pixel for visits and the $49 payment).
 *
 * The snippets are Google's, verbatim. They are rendered as plain inline markup
 * rather than through next/script so the head snippet runs during HTML parsing,
 * as Google intends, instead of waiting on Next's client runtime.
 *
 * Production builds only, so local dev sessions never reach the ad account.
 * Set GTM_IN_DEV=1 in .env.local to load it under `npm run dev` for a test.
 */
const GTM_ID = "GTM-5VSV8HXF";

const enabled =
  process.env.NODE_ENV === "production";

/** Goes as high as possible inside <head>. */
export function GoogleTagManagerHead() {
  if (!enabled) return null;

  return (
    // next/script would hold this back until Next's runtime loads (see above).
    // eslint-disable-next-line @next/next/next-script-for-ga
    <script
      id="gtm-head"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
      }}
    />
  );
}

/** Goes immediately after the opening <body> tag. */
export function GoogleTagManagerNoScript() {
  if (!enabled) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
