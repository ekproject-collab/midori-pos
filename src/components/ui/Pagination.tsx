import { Button } from "./Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** Simple prev/next pager. Renders nothing when everything fits on one page. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="border-border flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t pt-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="shrink-0 whitespace-nowrap"
      >
        ← Sebelumnya
      </Button>
      <span className="text-muted order-last w-full shrink-0 text-center text-xs whitespace-nowrap tabular-nums sm:order-0 sm:w-auto">
        Halaman {page} / {totalPages}
      </span>
      <Button
        size="sm"
        variant="ghost"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="shrink-0 whitespace-nowrap"
      >
        Berikutnya →
      </Button>
    </div>
  );
}
