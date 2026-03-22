import Link from 'next/link';

import { APP_ROUTES } from '@/features/games';

const footerLinks = [
  { href: APP_ROUTES.privacy, label: 'Privacy' },
  { href: APP_ROUTES.terms, label: 'Terms' },
  { href: APP_ROUTES.about, label: 'About' },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
            Build Order
          </p>
          <p className="max-w-2xl text-sm text-black/65">
            Start with Block Jam Blitz, stabilize the shared score pipeline, then
            extend into Snake Survivor and Brick Shot Rush.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-black/55">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-black">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
