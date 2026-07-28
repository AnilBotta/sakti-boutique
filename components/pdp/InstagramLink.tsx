import { Instagram } from 'lucide-react';

interface InstagramLinkProps {
  url: string;
}

/**
 * Secondary CTA rendered below Add to Cart on the PDP. Only mounted when
 * the product has an Instagram reel/post URL set in the admin editor.
 *
 * Copy is product-focused ("See it on video") rather than promotional
 * ("Watch on Instagram") so shoppers understand the click is about this
 * piece, not our social channel. The Instagram brand color on the icon
 * carries the "where it opens" cue.
 */
export function InstagramLink({ url }: InstagramLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="See this piece on video (opens Instagram in a new tab)"
      className="group flex min-h-[44px] items-center justify-center gap-2 border border-border-hairline px-5 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:border-text-primary hover:bg-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2"
    >
      {/* Instagram brand pink (#E4405F) so the platform is recognisable
          without spelling it out in the copy. */}
      <Instagram
        className="h-4 w-4"
        style={{ color: '#E4405F' }}
        strokeWidth={1.75}
        aria-hidden
      />
      See it on video
    </a>
  );
}
