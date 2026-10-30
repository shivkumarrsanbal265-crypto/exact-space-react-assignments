import React, { useState, useEffect, useRef, useCallback } from 'react';
import GalleryHeader from './components/GalleryHeader';
import PhotoCard from './components/PhotoCard';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import { fetchPhotosPage } from './services/photoService';
import './App.css';

const PAGE_SIZE = 10;

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [likes, setLikes] = useState({});
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Fetch photos for a specific page
  const loadPhotos = useCallback(async (pageToLoad) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const newItems = await fetchPhotosPage(
        pageToLoad,
        PAGE_SIZE,
        abortControllerRef.current.signal
      );

      if (!Array.isArray(newItems) || newItems.length === 0) {
        setHasMore(false);
      } else {
        setPhotos((prev) => {
          // Deduplicate by ID to prevent duplicate items
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        });
        setPage(pageToLoad + 1);
        if (newItems.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load photos. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial fetch for Page 1
  useEffect(() => {
    loadPhotos(1);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadPhotos]);

  // Set up IntersectionObserver for Infinite Scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        // Trigger load if sentinel is visible, not currently fetching, has more pages, and no active error
        if (firstEntry.isIntersecting && !isFetchingRef.current && hasMore && !error) {
          loadPhotos(page);
        }
      },
      {
        root: null,
        rootMargin: '200px', // Preload ahead before hitting exact bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [page, hasMore, error, loadPhotos]);

  // Like button handler: independently increments count for a specific photo
  // Preserves existing counts when new pages load
  const handleLike = useCallback((photoId) => {
    setLikes((prev) => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 1,
    }));
  }, []);

  // Retry failed page
  const handleRetry = () => {
    loadPhotos(page);
  };

  return (
    <div className="gallery-page-container">
      <GalleryHeader />

      <main className="gallery-feed" role="region" aria-label="Photo Gallery Feed">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            likes={likes[photo.id] || 0}
            onLike={handleLike}
          />
        ))}

        {/* Error message with retry */}
        {error && <ErrorMessage error={error} onRetry={handleRetry} />}

        {/* Loading indicator */}
        {isLoading && (
          <LoadingIndicator
            message={photos.length === 0 ? 'Loading photo gallery...' : 'Loading more photos...'}
          />
        )}

        {/* End of feed notice */}
        {!hasMore && photos.length > 0 && (
          <div className="gallery-end-banner">
            You've reached the end of the photo gallery.
          </div>
        )}

        {/* Infinite Scroll Sentinel element */}
        {hasMore && !error && <div ref={sentinelRef} className="gallery-sentinel" />}
      </main>
    </div>
  );
}

