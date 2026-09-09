import Image from "next/image";

import { cn } from "@/lib/cn";

/**
 * Product thumbnail with a branded fallback. Renders `next/image` with `fill`,
 * so the parent must be positioned and sized (all call sites use a fixed box
 * or an aspect-ratio container).
 */
export function ProductImage({
  src,
  alt,
  className,
  sizes = "128px",
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "bg-matcha-50 text-matcha-300 flex h-full w-full items-center justify-center text-4xl",
        className,
      )}
      aria-hidden
    >
      茶
    </div>
  );
}
