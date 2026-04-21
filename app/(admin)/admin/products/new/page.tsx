'use client';

import { ProductEditor } from '@/components/admin/product/ProductEditor';
import { makeEmptyEditableProduct } from '@/lib/admin/product-editor';

export default function NewProductPage() {
  const initial = makeEmptyEditableProduct();
  return <ProductEditor initial={initial} mode="create" />;
}
