import Link from 'next/link';

import { APP_ROUTES } from '@/features/games';

const navItems = [
  { href: APP_ROUTES.games, label: 'Games' },
  { href: APP_ROUTES.ranking, label: 'Ranking' },
  { href: APP_ROUTES.content, label: 'Content' },
  { href: APP_ROUTES.about, label: 'About' },
] as const;

export function SiteHeader() {
  return (
    <header
      id="site-header"
      className="sticky top-0 z-40 border-b border-black/10 bg-[color:var(--color-panel)]/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={APP_ROUTES.home} className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-accent)] text-sm font-semibold text-[color:var(--color-panel)]">
            RC
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-strong)]">
              Retro Casual
            </p>
            <p className="text-sm text-black/65">
              Modern browser games with short, replayable runs
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
