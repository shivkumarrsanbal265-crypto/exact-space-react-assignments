import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

export default function PhotoCard({ photo, likes, onLike }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLikeClick = () => {
    onLike(photo.id);
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 250);
  };

  return (
    <article className="photo-card" id={`photo-${photo.id}`}>
      {/* Photo Image Container */}
      <div className="photo-image-wrapper">
        {!imageLoaded && !imageError && <div className="photo-skeleton" />}
        {imageError ? (
          <div className="photo-fallback">Image unavailable</div>
        ) : (
          <img
            src={photo.download_url}
            alt={`Photograph by ${photo.author}`}
            className={`photo-image ${imageLoaded ? 'loaded' : 'loading'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        )}
      </div>

      {/* Author and Font Awesome Thumbs Up Like Section */}
      <div className="photo-meta">
        <span className="photo-author-label">Author: {photo.author}</span>
        <button
          type="button"
          className={`photo-like-btn ${isAnimating ? 'anim-pulse' : ''}`}
          onClick={handleLikeClick}
          title={`Like photo by ${photo.author} (Current: ${likes || 0})`}
          aria-label={`Like photo by ${photo.author}, currently ${likes || 0} likes`}
        >
          <FontAwesomeIcon icon={faThumbsUp} />
          <span className="photo-like-count">{likes || 0}</span>
        </button>
      </div>
    </article>
  );
}

