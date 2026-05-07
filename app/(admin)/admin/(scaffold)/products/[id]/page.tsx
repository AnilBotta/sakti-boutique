'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductEditor } from '@/components/admin/product/ProductEditor';
import { getAdminProductLocal } from '@/lib/admin/local-repo/products';
import type { EditableProduct } from '@/lib/admin/product-editor';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<EditableProduct | null | 'loading'>(
    'loading',
  );

  useEffect(() => {
    const found = getAdminProductLocal(params.id);
    setProduct(found);
  }, [params.id]);

  useEffect(() => {
    if (product === null) router.replace('/admin/products');
  }, [product, router]);

  if (product === 'loading' || product === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-caption text-text-muted">
        Loading…
      </div>
    );
  }

  return <ProductEditor initial={product} mode="edit" />;
}
