export function GeneratingState() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="rounded-2xl border border-zinc-200 bg-surface p-5 dark:border-zinc-800">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-8 w-32 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded" />
        </div>
        <div className="skeleton mt-4 h-2.5 w-full rounded-full" />
        <p className="mt-3 text-sm text-zinc-500">
          Building meals and estimating costs...
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <div className="skeleton aspect-[16/9] w-full" />
            <div className="space-y-3 p-4">
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
              <div className="skeleton h-4 w-full rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-surface p-5 dark:border-zinc-800">
        <div className="skeleton mb-4 h-5 w-32 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="skeleton h-4 w-full rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
