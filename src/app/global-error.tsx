"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself. Renders its
 * own document. Segment-level `error.tsx` files handle everything below.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#faf8f5",
          color: "#1c1917",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "24rem" }}>
          <p style={{ fontSize: "2rem" }}>🍵</p>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            Terjadi kesalahan
          </h1>
          <p style={{ color: "#6f6a61", margin: "0.5rem 0 1rem" }}>
            Muat ulang halaman. Jika masih bermasalah, hubungi admin.
          </p>
          <button
            onClick={reset}
            style={{
              border: "1px solid #3f4f28",
              background: "#536833",
              color: "#fff",
              fontWeight: 600,
              padding: "0.625rem 1.5rem",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
