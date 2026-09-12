import Image from "next/image";

import { cn } from "@/lib/cn";

export interface MidoriLogoProps {
  /** Rendered square size in px. */
  size?: number;
  className?: string;
  priority?: boolean;
}

/** The Midori | 茶 brand mark. Source is a square lockup (emblem + wordmark). */
export function MidoriLogo({
  size = 40,
  className,
  priority,
}: MidoriLogoProps) {
  return (
    <Image
      src="/brand/logo-midori.png"
      alt="Midori — Matcha & More"
      width={1254}
      height={1254}
      priority={priority}
      className={cn("object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
