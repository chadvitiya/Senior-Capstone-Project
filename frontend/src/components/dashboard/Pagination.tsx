export default function Pagination({ page, pageCount, onPageChange }: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  return <div className="flex items-center gap-3 text-sm">
    <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} className="rounded border border-line px-3 py-1.5 disabled:opacity-40">Previous</button>
    <span>Page {page} of {Math.max(1, pageCount)}</span>
    <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} className="rounded border border-line px-3 py-1.5 disabled:opacity-40">Next</button>
  </div>
}
