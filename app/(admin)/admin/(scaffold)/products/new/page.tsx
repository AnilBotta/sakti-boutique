import { ProductEditor } from '@/components/admin/product/ProductEditor';
import { newEditableProduct } from '@/lib/repositories/admin-products';

export default function NewProductPage() {
  const initial = newEditableProduct();
  return <ProductEditor initial={initial} mode="create" />;
}
