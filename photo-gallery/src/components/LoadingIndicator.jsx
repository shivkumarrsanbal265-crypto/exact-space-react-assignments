import React from 'react';

export default function LoadingIndicator({ message = 'Loading more photos...' }) {
  return (
    <div className="gallery-loading" role="status" aria-live="polite">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}

