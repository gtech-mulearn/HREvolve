export default function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
        isPublished
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  )
}
