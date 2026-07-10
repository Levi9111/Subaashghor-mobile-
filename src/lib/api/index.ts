import { request, requestEnvelope, USE_MOCKS } from "./client";
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
import { mockApi } from "./mock";

export * from "./types";
export { USE_MOCKS } from "./client";

// ----- Auth -----
export const authApi = {
  signup: (input: { name: string; email?: string; password?: string; phone: string }) =>
    USE_MOCKS ? mockApi.signup(input) : request<User>("/auth/signup", { method: "POST", body: input }),
  login: (input: { email?: string; phone?: string; password?: string }) =>
    USE_MOCKS ? mockApi.login(input) : request<User>("/auth/login", { method: "POST", body: input }),
  logout: () =>
    USE_MOCKS ? mockApi.logout() : request<{ ok: true }>("/auth/logout", { method: "POST" }),
  me: () => (USE_MOCKS ? mockApi.me() : request<User | null>("/auth/me")),
  forgotPassword: (email: string) =>
    USE_MOCKS
      ? Promise.resolve({ ok: true })
      : request<{ ok: true }>("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (input: { token: string; password: string }) =>
    USE_MOCKS
      ? Promise.resolve({ ok: true })
      : request<{ ok: true }>("/auth/reset-password", { method: "POST", body: input }),
};

// ----- Products -----
export const productsApi = {
  list: async (q: ProductListQuery = {}) => {
    if (USE_MOCKS) return mockApi.listProducts(q);
    const env = await requestEnvelope<Product[]>("/products", { query: q as never });
    return { items: env.data, meta: env.meta };
  },
  get: (slug: string) =>
    USE_MOCKS ? mockApi.getProduct(slug) : request<Product>(`/products/${slug}`),
  featured: () =>
    USE_MOCKS ? mockApi.featuredProducts() : request<Product[]>("/products/featured"),
};

// ----- Collections -----
export const collectionsApi = {
  list: () => (USE_MOCKS ? mockApi.listCollections() : request<Collection[]>("/collections")),
  get: (slug: string) =>
    USE_MOCKS ? mockApi.getCollection(slug) : request<Collection>(`/collections/${slug}`),
};

// ----- Posts (Blog) -----
export const postsApi = {
  list: () => (USE_MOCKS ? mockApi.listPosts() : request<Post[]>("/posts")),
  get: (slug: string) => (USE_MOCKS ? mockApi.getPost(slug) : request<Post>(`/posts/${slug}`)),
};

// ----- Coupons -----
export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    USE_MOCKS
      ? mockApi.validateCoupon(code, subtotal)
      : request<Coupon>("/coupons/validate", { method: "POST", body: { code, subtotal } }),
};

// ----- Reviews -----
export const reviewsApi = {
  listForProduct: (query: { productId?: string; productSlug?: string }) =>
    USE_MOCKS
      ? mockApi.listReviews(query.productId || "")
      : request<Review[]>(`/reviews`, { query: query as any }),
  create: (input: Omit<Review, "_id" | "createdAt">) =>
    USE_MOCKS
      ? mockApi.createReview(input)
      : request<Review>("/reviews", { method: "POST", body: input }),
};

// ----- Orders -----
export const ordersApi = {
  create: (input: {
    items: OrderItem[];
    shipping: ShippingAddress;
    paymentMethod: Order["paymentMethod"];
    couponCode?: string;
  }) =>
    USE_MOCKS ? mockApi.createOrder(input) : request<Order>("/orders", { method: "POST", body: input }),
  get: (idOrNumber: string) =>
    USE_MOCKS ? mockApi.getOrder(idOrNumber) : request<Order>(`/orders/${idOrNumber}`),
  mine: () => (USE_MOCKS ? mockApi.myOrders() : request<Order[]>("/orders/mine")),
};

// ----- Newsletter -----
export const newsletterApi = {
  subscribe: (email: string) =>
    USE_MOCKS
      ? mockApi.subscribe(email)
      : request<{ email: string }>("/newsletter/subscribe", { method: "POST", body: { email } }),
};
