import type { Product, Collection, Post, Coupon, Review, Order, User } from "../types";

const oudRoyale = "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80";
const roseMusk = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=80";
const midnightSaffron = "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop&q=80";
const jasmineNoir = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=80";

const blog1 = "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600&auto=format&fit=crop&q=80";
const blog2 = "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80";
const blog3 = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80";

export const mockProducts: Product[] = [
  {
    _id: "p1",
    slug: "oud-royale",
    name: { bn: "উদ রয়্যাল", en: "Oud Royale" },
    tagline: { bn: "রাজকীয় উদ এবং জাফরান", en: "Royal Oud & Saffron" },
    images: [oudRoyale],
    price: 6500,
    salePrice: 5500,
    badge: { bn: "বেস্ট সেলার", en: "Best Seller" },
    notes: {
      top: ["Saffron", "Bergamot"],
      heart: ["Cambodian Oud", "Rose"],
      base: ["Patchouli", "Amber", "Musk"],
    },
    category: "unisex",
    collections: ["signature"],
    sizes: [
      { ml: 3, price: 1200, stock: 20 },
      { ml: 12, price: 3200, stock: 12 },
      { ml: 50, price: 6500, salePrice: 5500, stock: 8 },
      { ml: 100, price: 11500, stock: 3 },
    ],
    rating: 4.8,
    reviewCount: 124,
  },
  {
    _id: "p2",
    slug: "rose-musk",
    name: { bn: "রোজ মাস্ক", en: "Rose Musk" },
    tagline: { bn: "দামাস্ক রোজ ও সাদা মাস্ক", en: "Damask Rose & White Musk" },
    images: [roseMusk],
    price: 4200,
    badge: { bn: "নতুন", en: "New" },
    notes: {
      top: ["Damask Rose", "Pink Pepper"],
      heart: ["Turkish Rose", "Jasmine"],
      base: ["White Musk", "Sandalwood"],
    },
    category: "women",
    collections: ["floral"],
    sizes: [
      { ml: 12, price: 2200, stock: 15 },
      { ml: 50, price: 4200, stock: 10 },
    ],
    rating: 4.6,
    reviewCount: 58,
  },
  {
    _id: "p3",
    slug: "midnight-saffron",
    name: { bn: "মিডনাইট জাফরান", en: "Midnight Saffron" },
    tagline: { bn: "জাফরান ও অ্যাম্বার", en: "Saffron & Amber" },
    images: [midnightSaffron],
    price: 8500,
    notes: {
      top: ["Saffron", "Cardamom"],
      heart: ["Oud", "Praline"],
      base: ["Vanilla", "Amber"],
    },
    category: "men",
    collections: ["signature"],
    sizes: [
      { ml: 30, price: 5200, stock: 6 },
      { ml: 50, price: 8500, stock: 4 },
      { ml: 100, price: 14500, stock: 2 },
    ],
    rating: 4.9,
    reviewCount: 41,
  },
  {
    _id: "p4",
    slug: "jasmine-noir",
    name: { bn: "জেসমিন নয়ার", en: "Jasmine Noir" },
    tagline: { bn: "মিস্টি জেসমিন ও ভ্যানিলা", en: "Mystic Jasmine & Vanilla" },
    images: [jasmineNoir],
    price: 3800,
    notes: {
      top: ["Bergamot", "Jasmine Petals"],
      heart: ["Sambac Jasmine", "Tuberose"],
      base: ["Vanilla", "Cedar"],
    },
    category: "women",
    collections: ["floral"],
    sizes: [
      { ml: 30, price: 2500, stock: 10 },
      { ml: 50, price: 3800, stock: 7 },
    ],
    rating: 4.7,
    reviewCount: 33,
  },
];

export const mockCollections: Collection[] = [
  {
    _id: "c1",
    slug: "signature",
    name: { bn: "স্বাক্ষর সংগ্রহ", en: "Signature Collection" },
    description: {
      bn: "আমাদের সবচেয়ে আইকনিক সুবাস।",
      en: "Our most iconic fragrances.",
    },
    cover: oudRoyale,
    productCount: 2,
  },
  {
    _id: "c2",
    slug: "floral",
    name: { bn: "ফুলেল সংগ্রহ", en: "Floral Collection" },
    description: {
      bn: "ফুলের কোমলতা ও গভীরতা।",
      en: "The softness and depth of blooms.",
    },
    cover: roseMusk,
    productCount: 2,
  },
];

export const mockPosts: Post[] = [
  {
    _id: "b1",
    slug: "art-of-attar",
    title: { bn: "আতরের শিল্প: একটি প্রাচীন ঐতিহ্য", en: "The Art of Attar: An Ancient Tradition" },
    excerpt: {
      bn: "শতাব্দীর পুরনো পদ্ধতিতে কীভাবে আতর তৈরি হয়।",
      en: "Discover how attars are crafted using centuries-old methods.",
    },
    category: { bn: "ঐতিহ্য", en: "Heritage" },
    cover: blog1,
    date: "2025-04-12",
  },
  {
    _id: "b2",
    slug: "choosing-summer-scent",
    title: { bn: "গ্রীষ্মের জন্য সঠিক সুবাস বাছাই", en: "How to Choose a Summer Scent" },
    excerpt: {
      bn: "গরম আবহাওয়ার জন্য হালকা ও তরতাজা সুগন্ধির গাইড।",
      en: "A guide to light, fresh fragrances for warm weather.",
    },
    category: { bn: "টিপস", en: "Fragrance Tips" },
    cover: blog3,
    date: "2025-04-05",
  },
  {
    _id: "b3",
    slug: "oud-explained",
    title: { bn: "উদ: কেন এটি 'তরল সোনা'", en: "Oud Explained: Why It's 'Liquid Gold'" },
    excerpt: {
      bn: "আগরউড থেকে উদ পর্যন্ত — একটি বিরল সম্পদের যাত্রা।",
      en: "From agarwood to oud — the journey of a rare treasure.",
    },
    category: { bn: "সুবাস ইতিহাস", en: "Scent History" },
    cover: blog2,
    date: "2025-03-28",
  },
];

export const mockCoupons: Coupon[] = [
  { _id: "cp1", code: "WELCOME10", type: "percent", value: 10, minSubtotal: 2000, active: true },
  { _id: "cp2", code: "FREESHIP", type: "flat", value: 130, minSubtotal: 1500, active: true },
];

export const mockReviews: Review[] = [
  {
    _id: "r1",
    productId: "p1",
    userId: "u1",
    userName: "Ayesha R.",
    rating: 5,
    title: "Heavenly",
    body: "Long-lasting and luxurious — the saffron opening is unreal.",
    createdAt: "2025-03-10",
  },
  {
    _id: "r2",
    productId: "p1",
    userId: "u2",
    userName: "Rakib H.",
    rating: 5,
    body: "My signature scent now. Compliments every time I wear it.",
    createdAt: "2025-02-22",
  },
];

export const mockOrders: Order[] = [];
export const mockUsers: User[] = [];
