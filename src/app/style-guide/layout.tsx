import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/** Internal design reference — not served in production. */
export default function StyleGuideLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
