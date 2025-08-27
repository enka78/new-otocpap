import { Product } from "./product";

export interface Order {
  id: number;
  user_id: string;
  user: string;
  status_id: number;
  status: OrderStatus;
  total: number;
  currency: string;
  products: string;
  shipping_address: string;
  billing_address: string;
  contact_number: string;
  appointment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStatus {
  id: number;
  name: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  display_name: string;
  color: string;
}

export interface OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}
