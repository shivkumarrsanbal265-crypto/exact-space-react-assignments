import React from 'react';

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div className="gallery-error-banner" role="alert">
      <div className="error-text">
        <strong>Error loading photos:</strong> {error}
      </div>
      {onRetry && (
        <button
          type="button"
          className="retry-btn"
          onClick={onRetry}
          aria-label="Retry loading photos"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

