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
    <div className="border-border flex items-center justify-between gap-2 border-t pt-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Sebelumnya
      </Button>
      <span className="text-muted text-xs tabular-nums">
        Halaman {page} / {totalPages}
      </span>
      <Button
        size="sm"
        variant="ghost"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Berikutnya →
      </Button>
    </div>
  );
}
