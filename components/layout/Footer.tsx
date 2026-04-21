import Image from 'next/image';
import Link from 'next/link';
import { Container } from './Container';
import { footerLinks } from '@/lib/site/navigation';
import { siteConfig } from '@/lib/site/config';

const columns = [
  { title: 'Shop', items: footerLinks.shop },
  { title: 'Help', items: footerLinks.help },
  { title: 'About', items: footerLinks.about },
];

export function Footer() {
  return (
    <footer className="border-t border-border-hairline pt-20 pb-10">
      <Container>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-12">
          <div>
            <Link href="/" aria-label="Sakthi Trends USA — Home" className="inline-block">
              <Image
                src="/sakthi logo.jpeg"
                alt="Sakthi Trends USA"
                width={180}
                height={96}
                className="h-auto w-[160px]"
              />
            </Link>
            <p className="mt-3 max-w-xs text-caption text-text-muted">
              {siteConfig.description}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-5 text-text-primary">{col.title}</p>
              <ul className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-body text-text-secondary hover:text-text-primary transition-colors duration-fast ease-standard"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border-hairline pt-8 md:flex-row md:items-center">
          <p className="text-caption text-text-muted">
            &copy; {new Date().getFullYear()} Sakthi Trends USA. All rights reserved.
          </p>
          <p className="text-caption text-text-muted">Crafted with care.</p>
        </div>
      </Container>
    </footer>
  );
}
