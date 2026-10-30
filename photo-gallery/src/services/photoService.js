/**
 * Service to fetch paginated photos from Picsum API
 * Supports direct API requests with automatic fallback to Vite local proxy if CORS blocks
 */
export async function fetchPhotosPage(page, limit = 10, signal) {
  const directUrl = `https://picsum.photos/v2/list?page=${page}&limit=${limit}`;
  const proxyUrl = `/api/picsum/v2/list?page=${page}&limit=${limit}`;

  try {
    const response = await fetch(directUrl, { signal });
    if (!response.ok) {
      throw new Error(`Server responded with HTTP status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (directErr) {
    // If request was aborted by user/unmount, rethrow
    if (directErr.name === 'AbortError') {
      throw directErr;
    }

    console.warn(`Direct fetch to Picsum failed (${directErr.message}), attempting fallback proxy...`);

    // Attempt fallback proxy
    try {
      const fallbackResponse = await fetch(proxyUrl, { signal });
      if (!fallbackResponse.ok) {
        throw new Error(`Proxy responded with HTTP status ${fallbackResponse.status}`);
      }
      const fallbackData = await fallbackResponse.json();
      return fallbackData;
    } catch (fallbackErr) {
      if (fallbackErr.name === 'AbortError') {
        throw fallbackErr;
      }
      throw new Error(
        `Failed to fetch photos for page ${page}: ${directErr.message || fallbackErr.message}`
      );
    }
  }
}

