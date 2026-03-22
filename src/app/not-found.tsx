import Link from 'next/link';

import { APP_ROUTES } from '@/features/games';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-strong)]">
        404
      </p>
      <h1 className="text-4xl font-semibold text-black">This route is not wired yet.</h1>
      <p className="max-w-xl text-base leading-7 text-black/68">
        The scaffold is in place, but this page does not have matching metadata
        or content yet.
      </p>
      <Link
        href={APP_ROUTES.home}
        className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-[color:var(--color-accent-strong)]"
      >
        Back to home
      </Link>
    </div>
  );
}
