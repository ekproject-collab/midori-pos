/** Format an integer amount of Rupiah, e.g. 18000 -> "Rp 18.000". */
export function formatRupiah(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

/** Format an ISO timestamp as a Jakarta wall-clock time, e.g. "14:05". */
export function formatJakartaTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

/** Format an ISO timestamp as a Jakarta date, e.g. "9 Sep 2026". */
export function formatJakartaDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

/** Current shop-day (Asia/Jakarta) as `YYYY-MM-DD`. */
export function jakartaToday(date: Date = new Date()): string {
  // en-CA formats as ISO-style YYYY-MM-DD
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}
