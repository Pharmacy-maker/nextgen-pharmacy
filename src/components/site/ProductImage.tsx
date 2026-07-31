import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { FALLBACK_PRODUCT_IMAGE, placeholderProductImage, resolveImageUrl } from "../../lib/images";

type ProductImageProps = {
  /** Stored image path or URL (from mock data today, database later). */
  src?: string | null;
  alt: string;
  /** Used to pick a deterministic placeholder when no image is stored. */
  seed?: string | number;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;

/**
 * Single place where product imagery is rendered.
 * Guarantees every product shows an image, even if the stored path is
 * missing or the remote file fails to load.
 */
export function ProductImage({ src, alt, seed, loading = "lazy", ...rest }: ProductImageProps) {
  const fallback = seed !== undefined ? placeholderProductImage(seed) : FALLBACK_PRODUCT_IMAGE;
  const resolved = resolveImageUrl(src, fallback);
  const [current, setCurrent] = useState(resolved);

  useEffect(() => setCurrent(resolved), [resolved]);

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      loading={loading}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
