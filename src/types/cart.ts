import { Product } from './product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  product_id?: string;
}
