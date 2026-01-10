import React, { useState } from 'react';
import HandGestureIcon from './HandGestureIcon';
import './ImageWithFallback.css';

function ImageWithFallback({ src, alt, letter, className, style, showIcon = true }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // If image fails to load or no src, show hand gesture icon
  if (imageError || !src) {
    if (showIcon) {
      return (
        <div className={`icon-fallback-container ${className || ''}`} style={style}>
          <HandGestureIcon letter={letter || alt} size="medium" />
        </div>
      );
    }
    return (
      <div className={`letter-fallback ${className || ''}`} style={style}>
        <div className="letter-display">{letter || alt}</div>
        <div className="fallback-note">Add image for visual learning</div>
      </div>
    );
  }

  return (
    <div className={`image-container ${className || ''}`} style={style}>
      {isLoading && (
        <div className="image-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
        className="gesture-image-loaded"
      />
    </div>
  );
}

export default ImageWithFallback;

