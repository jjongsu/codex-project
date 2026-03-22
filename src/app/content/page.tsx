import { GAME_METADATA } from '@/features/games';

export default function ContentPage() {
  const plannedArticles = GAME_METADATA.flatMap((game) => game.contentPlan);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
          /content
        </p>
        <h1 className="text-4xl font-semibold text-black">Content Pipeline</h1>
        <p className="max-w-2xl text-base leading-7 text-black/68">
          Guides and retro context articles will support SEO, onboarding, and
          game-specific discovery.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plannedArticles.map((article) => (
          <article
            key={article.articleSlug}
            className="rounded-[28px] border border-black/10 bg-white/88 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <p className="text-sm font-semibold text-black">{article.title}</p>
            <p className="mt-2 text-xs text-black/50">{article.articleSlug}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
