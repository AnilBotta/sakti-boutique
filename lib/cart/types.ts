export interface CartLineItem {
  /** Stable line id — `${productId}:${size ?? ''}:${color ?? ''}` */
  id: string;
  productId: string;
  slug: string;
  name: string;
  variant: {
    size?: string;
    color?: string;
  };
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}
