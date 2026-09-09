import { cn } from "@/lib/cn";

/**
 * Product thumbnail with a branded fallback. Uses a plain <img> for now —
 * real uploads land in Phase 8, where next/image + Supabase Storage remote
 * patterns get configured.
 */
export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
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
