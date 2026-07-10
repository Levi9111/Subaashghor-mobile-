import { request, requestEnvelope } from "./client";
import type {
  Product,
  Collection,
  Post,
  Coupon,
  Review,
  Order,
  User,
  ProductListQuery,
  ShippingAddress,
  OrderItem,
} from "./types";

export * from "./types";

// ----- Auth -----
export const authApi = {
  signup: (input: { name: string; email?: string; password?: string; phone: string }) =>
    request<User>("/auth/signup", { method: "POST", body: input }),
  login: (input: { email?: string; phone?: string; password?: string }) =>
    request<User>("/auth/login", { method: "POST", body: input }),
  logout: () =>
    request<{ ok: true }>("/auth/logout", { method: "POST" }),
  me: () => request<User | null>("/auth/me"),
  forgotPassword: (email: string) =>
    request<{ ok: true }>("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (input: { token: string; password: string }) =>
    request<{ ok: true }>("/auth/reset-password", { method: "POST", body: input }),
};

// ----- Products -----
export const productsApi = {
  list: async (q: ProductListQuery = {}) => {
    const env = await requestEnvelope<Product[]>("/products", { query: q as never });
    return { items: env.data, meta: env.meta };
  },
  get: (slug: string) => request<Product>(`/products/${slug}`),
  featured: () => request<Product[]>("/products/featured"),
};

// ----- Collections -----
export const collectionsApi = {
  list: () => request<Collection[]>("/collections"),
  get: (slug: string) => request<Collection>(`/collections/${slug}`),
};

// ----- Posts (Blog) -----
export const postsApi = {
  list: () => request<Post[]>("/posts"),
  get: (slug: string) => request<Post>(`/posts/${slug}`),
};

// ----- Coupons -----
export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    request<Coupon>("/coupons/validate", { method: "POST", body: { code, subtotal } }),
};

// ----- Reviews -----
export const reviewsApi = {
  listForProduct: (query: { productId?: string; productSlug?: string }) =>
    request<Review[]>(`/reviews`, { query: query as any }),
  create: (input: Omit<Review, "_id" | "createdAt">) =>
    request<Review>("/reviews", { method: "POST", body: input }),
};

// ----- Orders -----
export const ordersApi = {
  create: (input: {
    items: OrderItem[];
    shipping: ShippingAddress;
    paymentMethod: Order["paymentMethod"];
    couponCode?: string;
  }) =>
    request<Order>("/orders", { method: "POST", body: input }),
  get: (idOrNumber: string) => request<Order>(`/orders/${idOrNumber}`),
  mine: () => request<Order[]>("/orders/mine"),
};

// ----- Newsletter -----
export const newsletterApi = {
  subscribe: (email: string) =>
    request<{ email: string }>("/newsletter/subscribe", { method: "POST", body: { email } }),
};

// ----- Settings -----
export const settingsApi = {
  get: () => request<any>("/settings"),
};
