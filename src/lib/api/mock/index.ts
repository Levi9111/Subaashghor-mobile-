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
  ApiEnvelope,
} from "../types";
import {
  mockProducts,
  mockCollections,
  mockPosts,
  mockCoupons,
  mockReviews,
  mockOrders,
} from "./data";

const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function paginate<T>(items: T[], page = 1, limit = 12) {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    meta: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
}

export const mockApi = {
  async listProducts(q: ProductListQuery = {}): Promise<{
    items: Product[];
    meta: ApiEnvelope<unknown>["meta"];
  }> {
    await sleep();
    let items = [...mockProducts];
    if (q.category) items = items.filter((p) => p.category === q.category);
    if (q.collection) items = items.filter((p) => p.collections.includes(q.collection!));
    if (q.minPrice != null) items = items.filter((p) => (p.salePrice ?? p.price) >= q.minPrice!);
    if (q.maxPrice != null) items = items.filter((p) => (p.salePrice ?? p.price) <= q.maxPrice!);
    if (q.notes?.length) {
      items = items.filter((p) => {
        const all = [...p.notes.top, ...p.notes.heart, ...p.notes.base].map((n) => n.toLowerCase());
        return q.notes!.some((n) => all.includes(n.toLowerCase()));
      });
    }
    if (q.q) {
      const needle = q.q.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.en.toLowerCase().includes(needle) ||
          p.name.bn.includes(q.q!) ||
          p.slug.includes(needle)
      );
    }
    if (q.sort === "price-asc") items.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    if (q.sort === "price-desc") items.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    return paginate(items, q.page ?? 1, q.limit ?? 12);
  },

  async getProduct(slug: string): Promise<Product> {
    await sleep();
    const p = mockProducts.find((x) => x.slug === slug);
    if (!p) throw new Error("Product not found");
    return p;
  },

  async featuredProducts(): Promise<Product[]> {
    await sleep();
    return mockProducts.slice(0, 4);
  },

  async listCollections(): Promise<Collection[]> {
    await sleep();
    return mockCollections;
  },
  async getCollection(slug: string): Promise<Collection> {
    await sleep();
    const c = mockCollections.find((x) => x.slug === slug);
    if (!c) throw new Error("Collection not found");
    return c;
  },

  async listPosts(): Promise<Post[]> {
    await sleep();
    return mockPosts;
  },
  async getPost(slug: string): Promise<Post> {
    await sleep();
    const p = mockPosts.find((x) => x.slug === slug);
    if (!p) throw new Error("Post not found");
    return p;
  },

  async validateCoupon(code: string, subtotal: number): Promise<Coupon> {
    await sleep();
    const c = mockCoupons.find((x) => x.code.toLowerCase() === code.toLowerCase() && x.active);
    if (!c) throw new Error("Invalid coupon");
    if (c.minSubtotal && subtotal < c.minSubtotal) throw new Error("Subtotal too low for this coupon");
    return c;
  },

  async listReviews(productId: string): Promise<Review[]> {
    await sleep();
    return mockReviews.filter((r) => r.productId === productId);
  },
  async createReview(input: Omit<Review, "_id" | "createdAt">): Promise<Review> {
    await sleep();
    const review: Review = { ...input, _id: `r${Date.now()}`, createdAt: new Date().toISOString() };
    mockReviews.unshift(review);
    return review;
  },

  async signup(input: { name: string; email?: string; password?: string; phone: string }): Promise<User> {
    await sleep();
    return {
      _id: `u${Date.now()}`,
      name: input.name,
      email: input.email || "",
      phone: input.phone,
      role: "customer",
      createdAt: new Date().toISOString(),
    };
  },
  async login(input: { email?: string; phone?: string; password?: string }): Promise<User> {
    await sleep();
    return {
      _id: "u1",
      name: "Demo User",
      email: input.email || "demo@gmail.com",
      phone: input.phone || "01700000000",
      role: "customer",
      createdAt: new Date().toISOString(),
    };
  },
  async logout(): Promise<{ ok: true }> {
    await sleep(80);
    return { ok: true };
  },
  async me(): Promise<User | null> {
    await sleep(80);
    return null;
  },

  async createOrder(input: {
    items: OrderItem[];
    shipping: ShippingAddress;
    paymentMethod: Order["paymentMethod"];
    couponCode?: string;
  }): Promise<Order> {
    await sleep();
    const subtotal = input.items.reduce((s, i) => s + i.price * i.qty, 0);
    const shippingFee = subtotal >= 3000 ? 0 : 130;
    let discount = 0;
    if (input.couponCode) {
      try {
        const c = await mockApi.validateCoupon(input.couponCode, subtotal);
        discount = c.type === "flat" ? c.value : Math.round((subtotal * c.value) / 100);
        if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
      } catch {
        discount = 0;
      }
    }
    const order: Order = {
      _id: `o${Date.now()}`,
      orderNumber: `SG-${Math.floor(100000 + Math.random() * 900000)}`,
      items: input.items,
      shipping: input.shipping,
      subtotal,
      shippingFee,
      discount,
      total: subtotal + shippingFee - discount,
      couponCode: input.couponCode,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    mockOrders.push(order);
    return order;
  },
  async getOrder(orderNumberOrId: string): Promise<Order> {
    await sleep();
    const o = mockOrders.find((x) => x._id === orderNumberOrId || x.orderNumber === orderNumberOrId);
    if (!o) throw new Error("Order not found");
    return o;
  },
  async myOrders(): Promise<Order[]> {
    await sleep();
    return mockOrders;
  },

  async subscribe(email: string): Promise<{ email: string }> {
    await sleep(150);
    return { email };
  },
};
