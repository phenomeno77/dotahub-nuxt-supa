// utils/autoLink.ts
import DOMPurify from "dompurify";

export function autoLinkText(text: string): string {
  const urlRegex = /((https?:\/\/[^\s<]+))/g;
  const linked = text.replace(
    urlRegex,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );

  return DOMPurify.sanitize(linked);
}
