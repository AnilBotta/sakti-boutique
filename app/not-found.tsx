import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow text-accent-ember">404</p>
      <h1 className="mt-3 text-h1 font-medium">Page not found</h1>
      <p className="mt-3 max-w-md text-body text-text-secondary">
        The page you're looking for has moved or never existed.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-md bg-accent-ember px-6 text-button font-medium text-bg-canvas transition-colors duration-fast ease-standard hover:bg-[#b04e16]"
      >
        Return home
      </Link>
    </div>
  );
}
