export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown> & {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorBody {
  success: false;
  message: string;
  data?: null;
  errors?: Record<string, string[]> | string[];
}

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;
  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface Bilingual {
  bn: string;
  en: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface Size {
  ml: number;
  price: number;
  salePrice?: number;
  stock: number;
  sku?: string;
}

export interface Notes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  _id: string;
  slug: string;
  name: Bilingual;
  tagline: Bilingual;
  description?: Bilingual;
  images: string[];
  price: number;
  salePrice?: number;
  badge?: Bilingual;
  notes: Notes;
  category: "men" | "women" | "attar" | "unisex";
  collections: string[];
  sizes: Size[];
  rating?: number;
  reviewCount?: number;
  isActive?: boolean;
  createdAt?: string;
  saleEndsAt?: string;
  pairsWith?: string[];
}

export interface Collection {
  _id: string;
  slug: string;
  name: Bilingual;
  description?: Bilingual;
  cover?: string;
  productCount?: number;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  category?: Product["category"];
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  notes?: string[];
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  q?: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  ml: number;
  price: number;
  qty: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  area: string;
  city: string;
  district: string;
  postcode?: string;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  items: OrderItem[];
  shipping: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: "cod" | "bkash";
  paymentStatus: "pending" | "paid" | "failed";
  status: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  expiresAt?: string;
  active: boolean;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  slug: string;
  title: Bilingual;
  excerpt: Bilingual;
  content?: Bilingual;
  category: Bilingual;
  cover: string;
  date: string;
  author?: {
    name: string;
    avatarUrl?: string;
  };
}
