import { useEffect, useId, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';

type ZoomableImageProps = {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** Gallery of images; defaults to [src] */
  images?: string[];
  /** Starting index within images when this thumb is clicked */
  index?: number;
  loading?: 'lazy' | 'eager';
  /** Thumbnail aspect before lightbox — default 1:1 */
  square?: boolean;
};

function isPhotoUrl(src: string) {
  return src.startsWith('/') || src.startsWith('http') || src.startsWith('data:');
}

export function ZoomableImage({
  src,
  alt = '',
  className = '',
  style,
  images,
  index = 0,
  loading = 'lazy',
  square = true,
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const gallery = (images?.length ? images : [src]).filter(Boolean);
  const start = Math.min(Math.max(index, 0), Math.max(gallery.length - 1, 0));

  if (!isPhotoUrl(src)) {
    return <span className={className} style={style}>{src}</span>;
  }

  return (
    <>
      <button
        type="button"
        className={`zoomable-image-btn ${square ? 'zoomable-image-square' : ''} ${className}`}
        style={style}
        onClick={(e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="查看大图"
      >
        <img src={src} alt={alt} loading={loading} className="zoomable-image-thumb" draggable={false} />
      </button>
      {open && (
        <ImageLightbox
          images={gallery}
          startIndex={start}
          alt={alt}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ImageLightbox({
  images,
  startIndex,
  alt,
  onClose,
}: {
  images: string[];
  startIndex: number;
  alt: string;
  onClose: () => void;
}) {
  const [i, setI] = useState(startIndex);
  const titleId = useId();
  const src = images[i] || images[0];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setI((v) => (v + 1) % images.length);
      if (e.key === 'ArrowLeft') setI((v) => (v - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [images.length, onClose]);

  return createPortal(
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <p id={titleId} className="sr-only">查看大图</p>
      <button type="button" className="image-lightbox-close" onClick={onClose} aria-label="关闭">
        ×
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="image-lightbox-nav image-lightbox-prev"
            aria-label="上一张"
            onClick={(e) => {
              e.stopPropagation();
              setI((v) => (v - 1 + images.length) % images.length);
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="image-lightbox-nav image-lightbox-next"
            aria-label="下一张"
            onClick={(e) => {
              e.stopPropagation();
              setI((v) => (v + 1) % images.length);
            }}
          >
            ›
          </button>
          <div className="image-lightbox-counter" onClick={(e) => e.stopPropagation()}>
            {i + 1} / {images.length}
          </div>
        </>
      )}
      <img
        src={src}
        alt={alt}
        className="image-lightbox-img"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
      <p className="image-lightbox-hint">点击空白处关闭 · 可左右切换</p>
    </div>,
    document.body
  );
}
