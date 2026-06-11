/** X/Twitter web intent for sharing a verified certificate. */
export function xShareUrl(url: string, text: string): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/** LinkedIn share-offsite link. LinkedIn pulls title/description from the page's OG tags. */
export function linkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

/** WhatsApp click-to-chat prefilled with the message + link. */
export function whatsAppShareUrl(url: string, text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
}
