// Fetches placeholder video thumbnails from the Unsplash API
// Returns an array of Unsplash Source URLs for dummy video thumbnails (no API key needed)
export async function fetchThumbnails(count = 6) {
  // Use picsum.photos for reliable placeholder images
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/400/225?random=${i}`);
}
