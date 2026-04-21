import { Truck, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';
import { Container } from './Container';

const items = [
  { icon: Truck, label: 'Complimentary Shipping', copy: 'On orders over $150 across the US.' },
  { icon: RefreshCw, label: 'Easy Returns', copy: '14-day hassle-free returns.' },
  { icon: ShieldCheck, label: 'Secure Checkout', copy: 'Protected by Stripe.' },
  { icon: Sparkles, label: 'Crafted with Care', copy: 'Curated by our atelier team.' },
];

export function TrustStrip() {
  return (
    <section className="border-t border-border-hairline py-10 md:py-14">
      <Container>
        <ul className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {items.map(({ icon: Icon, label, copy }) => (
            <li key={label} className="flex flex-col items-start gap-2">
              <Icon className="h-5 w-5 text-text-primary" strokeWidth={1.5} />
              <p className="eyebrow text-text-primary">{label}</p>
              <p className="text-caption text-text-muted">{copy}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
