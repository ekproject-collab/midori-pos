import type { ReactNode } from "react";

import { CartProvider } from "@/components/cart/CartProvider";

export default function KioskLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
