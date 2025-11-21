export function hasRealContent(html) {
  if (!html) return false;

  // HTML taglerini tamamen temizle
  const textOnly = html.replace(/<[^>]*>/g, "").trim();

  return textOnly.length > 0;
}
