export default function ProjectsLoading() {
  return (
    <div className="flex flex-col gap-16 pb-8 pt-12 sm:pt-16">
      <header className="max-w-3xl">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-14 animate-pulse rounded bg-surface-2" />
          <div className="h-px w-8 bg-border" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-surface-2" />
        </div>
        <div className="mt-6 h-11 w-[min(24rem,80%)] animate-pulse rounded-lg bg-surface-2 sm:h-14" />
        <div className="mt-5 h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
        <div className="mt-2 h-4 w-3/4 max-w-md animate-pulse rounded bg-surface-2" />
      </header>

      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div className="flex items-baseline gap-3">
            <div className="h-2.5 w-5 animate-pulse rounded bg-surface-2" />
            <div className="h-6 w-32 animate-pulse rounded bg-surface-2" />
          </div>
          <div className="h-2.5 w-24 animate-pulse rounded bg-surface-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border bg-surface p-6"
            >
              <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
              <div className="mt-6 h-3 w-16 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div className="flex items-baseline gap-3">
            <div className="h-2.5 w-5 animate-pulse rounded bg-surface-2" />
            <div className="h-6 w-40 animate-pulse rounded bg-surface-2" />
          </div>
          <div className="h-2.5 w-28 animate-pulse rounded bg-surface-2" />
        </div>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-full border border-border bg-surface"
            />
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-4 w-36 animate-pulse rounded bg-surface-2" />
                <div className="h-5 w-14 animate-pulse rounded-full bg-surface-2" />
              </div>
              <div className="mt-4 h-3 w-full animate-pulse rounded bg-surface-2" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-surface-2" />
              <div className="mt-6 flex gap-3">
                <div className="h-3 w-16 animate-pulse rounded bg-surface-2" />
                <div className="h-3 w-10 animate-pulse rounded bg-surface-2" />
                <div className="h-3 w-14 animate-pulse rounded bg-surface-2" />
              </div>
              <div className="mt-5 h-3 w-20 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
