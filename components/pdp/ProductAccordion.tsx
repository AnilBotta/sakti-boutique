import type { ProductDetails } from '@/lib/catalog/product-details';

interface ProductAccordionProps {
  product: ProductDetails;
}

/**
 * Native <details> accordion. Accessible by default, zero client JS.
 */
export function ProductAccordion({ product }: ProductAccordionProps) {
  return (
    <div className="divide-y divide-border-hairline border-y border-border-hairline">
      <Item title="Description" defaultOpen>
        <p className="text-body text-text-secondary">{product.fullDescription}</p>
      </Item>

      <Item title="Fabric & Care">
        <ul className="space-y-2 text-body text-text-secondary">
          {product.careInstructions.map((line, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden className="mt-[0.6em] h-px w-4 shrink-0 bg-border-hairline" />
              <span>{line}</span>
            </li>
          ))}
          <li className="pt-2 text-caption text-text-muted">
            Fabric: {product.fabric}
          </li>
        </ul>
      </Item>

      <Item title="Shipping & Returns">
        <div className="space-y-3 text-body text-text-secondary">
          <p>{product.shippingSummary}</p>
          <p>{product.returnSummary}</p>
        </div>
      </Item>
    </div>
  );
}

function Item({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-body-lg font-medium text-text-primary [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span
          aria-hidden
          className="ml-4 text-text-muted transition-transform duration-fast ease-standard group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pb-6 pr-6">{children}</div>
    </details>
  );
}
