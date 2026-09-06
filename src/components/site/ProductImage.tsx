import { useEffect, useState, type ImgHTMLAttributes } from "react";
import {
  FALLBACK_PRODUCT_IMAGE,
  placeholderProductImage,
  resolveImageUrl,
} from "../../lib/images";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  seed?: string | number;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;

export function ProductImage({
  src,
  alt,
  seed,
  loading = "lazy",
  ...rest
}: ProductImageProps) {
  const fallback =
    seed !== undefined
      ? placeholderProductImage(seed)
      : FALLBACK_PRODUCT_IMAGE;

  const resolved = resolveImageUrl(src, fallback);

  const [current, setCurrent] = useState(resolved);

  useEffect(() => {
    setCurrent(resolved);
  }, [resolved]);

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      loading={loading}
      onError={() => {
        setCurrent(fallback);
      }}
    />
  );
}