import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Midori POS — Matcha & Coffee Kiosk",
  description:
    "Self-ordering kiosk POS for a matcha & coffee shop, with a single-admin dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
