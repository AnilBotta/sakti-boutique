import { notFound } from 'next/navigation';
import { ProductEditor } from '@/components/admin/product/ProductEditor';
import { getAdminProduct } from '@/lib/repositories/admin-products';

interface PageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: PageProps) {
  const product = await getAdminProduct(params.id);
  if (!product) notFound();
  return <ProductEditor initial={product} mode="edit" />;
}
