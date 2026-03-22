export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="rounded-[32px] border border-black/10 bg-white/88 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
          /about
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-black">
          Retro-inspired, trend-aware browser games
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-black/68">
          This project starts with a shared score system, short-session game
          loops, and content expansion in mind so the portal can grow without
          rewriting its foundations.
        </p>
      </div>
    </div>
  );
}
