export function parseImageUrls(imageUrls?: string): string[] {
  if (!imageUrls) return [];

  return imageUrls
    .split(/[\n,]/)
    .map(url => url.trim())
    .filter(Boolean);
}
