import { Instagram } from 'lucide-react';

interface InstagramLinkProps {
  url: string;
}

/**
 * Secondary CTA rendered below Add to Cart on the PDP. Only mounted when
 * the product has an Instagram reel/post URL set in the admin editor.
 *
 * Deliberately quiet — outlined, monotone, no accent-ember fill — so it
 * doesn't fight the primary purchase CTA immediately above.
 */
export function InstagramLink({ url }: InstagramLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-[44px] items-center justify-center gap-2 border border-border-hairline px-5 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:border-text-primary hover:bg-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2"
    >
      <Instagram
        className="h-4 w-4 text-text-secondary transition-colors duration-fast ease-standard group-hover:text-text-primary"
        strokeWidth={1.5}
      />
      Watch on Instagram
    </a>
  );
}
