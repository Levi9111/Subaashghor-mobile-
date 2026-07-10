import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import { useLang } from "@/lib/i18n";
import { Colors } from "@/constants/theme";
import Animated, { FadeInDown } from "react-native-reanimated";
import { productsApi, Product, collectionsApi, Collection, postsApi, Post } from "@/lib/api";
import { useWishlist } from "@/lib/wishlist";
import { Heart, Star, ShoppingBag, ArrowRight, BookOpen } from "lucide-react-native";

const { width } = Dimensions.get("window");

const BANNERS = [
  {
    id: 1,
    title: "Oud Royale",
    subtitleBn: "রাজকীয় উদ এবং জাফরানের অনন্য মেলবন্ধন",
    subtitleEn: "Royal Oud & Saffron Blend",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80",
    slug: "oud-royale"
  },
  {
    id: 2,
    title: "Saffron Intense",
    subtitleBn: "তাজা জাফরান এবং কস্তুরীর তীব্র সুবাস",
    subtitleEn: "Intense Saffron & Premium Musk",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
    slug: "oud-royale"
  },
  {
    id: 3,
    title: "Rose & Musk",
    subtitleBn: "গোলাপের পাপড়ি এবং চন্দনের মিষ্টি সুবাস",
    subtitleEn: "Sweet Rose Petals & Sandalwood",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80",
    slug: "oud-royale"
  }
];

const TESTIMONIALS = [
  {
    id: "t1",
    name: "Tanvir Rahman",
    rating: 5,
    quoteBn: "আসল ও দীর্ঘস্থায়ী ঘ্রাণ! উদ রয়্যাল আতরটির সুরভী সারাদিন আচ্ছন্ন করে রাখে। প্যাকেজিং সত্যিই প্রশংসনীয় ছিল।",
    quoteEn: "Authentic and extremely long-lasting scent! Oud Royale kept me smelling great all day. The packaging was highly premium.",
  },
  {
    id: "t2",
    name: "Nusrat Jahan",
    rating: 5,
    quoteBn: "রোজ মাস্ক পারফিউমটা অসাধারণ মিষ্টি একটা ফ্লোরাল সুবাস। তাদের কাস্টমার সার্ভিস ও দ্রুত ডেলিভারির জন্য ধন্যবাদ।",
    quoteEn: "Rose Musk is a beautiful sweet floral fragrance. Excellent client support and super fast delivery. Highly recommended!",
  },
  {
    id: "t3",
    name: "Zamil Hossain",
    rating: 5,
    quoteBn: "মিডনাইট জাফরান একদম অনন্য একটি ফ্লেভার। এর উডি এবং স্পাইসি নোটগুলো অনেক চমৎকার ও রাজকীয় আমেজ দেয়।",
    quoteEn: "Midnight Saffron is an incredibly unique fragrance. Its woody and spicy notes offer an elegant, royal vibe.",
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const wishlist = useWishlist();

  const [featured, setFeatured] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = React.useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (activeSlide + 1) % BANNERS.length;
      setActiveSlide(nextSlide);
      scrollRef.current?.scrollTo({ x: nextSlide * (width - 32), animated: true });
    }, 4500);
    return () => clearInterval(timer);
  }, [activeSlide]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const featuredData = await productsApi.featured();
        const collectionsData = await collectionsApi.list();
        setFeatured(featuredData);
        setCollections(collectionsData);
        try {
          const postsData = await postsApi.list();
          setPosts(postsData);
        } catch (err) {
          console.error("Failed to load blog posts:", err);
        }
      } catch (err) {
        console.error("Failed to load home page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => {
    const hasSale = item.salePrice && item.salePrice < item.price;
    const currentPrice = hasSale ? item.salePrice : item.price;

    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(450)}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/products/${item.slug}`)}
          style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {/* Wishlist toggle */}
          <TouchableOpacity
            onPress={() => wishlist.toggle(item.slug)}
            style={styles.wishlistBtn}
          >
            <Heart
              size={18}
              color={wishlist.has(item.slug) ? "#d32f2f" : colors.muted}
              fill={wishlist.has(item.slug) ? "#d32f2f" : "none"}
            />
          </TouchableOpacity>

          {/* Badge */}
          {item.badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{lang === "bn" ? item.badge.bn : item.badge.en}</Text>
            </View>
          )}

          {/* Image */}
          <Image source={{ uri: item.images[0] }} style={styles.productImage} resizeMode="cover" />

          {/* Info */}
          <View style={styles.productInfo}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {t(
                item.category === "attar" ? "আতর" : item.category === "men" ? "পুরুষ" : "মহিলা",
                item.category.toUpperCase()
              )}
            </Text>
            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
              {lang === "bn" ? item.name.bn : item.name.en}
            </Text>
            
            {/* Rating */}
            <View style={styles.ratingRow}>
              <Star size={12} color="#c9a84c" fill="#c9a84c" />
              <Text style={[styles.ratingVal, { color: colors.text }]}>
                {item.rating?.toFixed(1) || "5.0"}
              </Text>
            </View>

            {/* Pricing Row */}
            <View style={styles.priceRow}>
              <View style={styles.priceContainer}>
                <Text style={[styles.priceText, { color: colors.primary }]}>৳{currentPrice}</Text>
                {hasSale && <Text style={styles.oldPriceText}>৳{item.price}</Text>}
              </View>
              <View style={[styles.buyBtn, { backgroundColor: colors.primary }]}>
                <ShoppingBag size={14} color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCollectionItem = ({ item, index }: { item: Collection; index: number }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/shop?collection=${item.slug}`)}
          style={styles.collectionCard}
        >
          <ImageBackground
            source={{ uri: item.cover }}
            style={styles.collectionBg}
            imageStyle={{ borderRadius: 12 }}
          >
            <View style={styles.collectionOverlay}>
              <Text style={styles.collectionName}>{lang === "bn" ? item.name.bn : item.name.en}</Text>
              <Text style={styles.collectionDesc}>
                {lang === "bn" ? item.description?.bn : item.description?.en}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPostItem = ({ item, index }: { item: Post; index: number }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(450)}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Image source={{ uri: item.cover }} style={styles.postImage} />
          <View style={styles.postInfo}>
            <Text style={[styles.postCategory, { color: colors.primary }]}>
              {lang === "bn" ? item.category.bn : item.category.en}
            </Text>
            <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>
              {lang === "bn" ? item.title.bn : item.title.en}
            </Text>
            <Text style={[styles.postDate, { color: colors.muted }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTestimonialItem = ({ item, index }: { item: typeof TESTIMONIALS[0]; index: number }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(450)}>
        <View style={[styles.testimonialCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.ratingRow}>
            {Array.from({ length: item.rating }).map((_, i) => (
              <Star key={i} size={13} color="#c9a84c" fill="#c9a84c" style={{ marginRight: 2 }} />
            ))}
          </View>
          <Text style={[styles.testimonialQuote, { color: colors.text }]} numberOfLines={4}>
            "{lang === "bn" ? item.quoteBn : item.quoteEn}"
          </Text>
          <Text style={[styles.testimonialAuthor, { color: colors.primary }]}>
            - {item.name}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Working Hero Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
              setActiveSlide(slide);
            }}
            style={styles.heroScrollView}
          >
            {BANNERS.map((banner) => (
              <ImageBackground
                key={banner.id}
                source={{ uri: banner.image }}
                style={[styles.heroBackgroundItem, { width: width - 32 }]}
                imageStyle={{ borderRadius: 12 }}
              >
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{banner.title}</Text>
                  <Text style={styles.heroTagline}>
                    {lang === "bn" ? banner.subtitleBn : banner.subtitleEn}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push(`/products/${banner.slug}`)}
                    style={[styles.heroBtn, { backgroundColor: "#c9a84c" }]}
                  >
                    <Text style={styles.heroBtnText}>{t("সংগ্রহ করুন", "Shop Now")}</Text>
                    <ArrowRight size={14} color="#1c0507" />
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            ))}
          </ScrollView>

          {/* Carousel Dot Indicators */}
          <View style={styles.dotContainer}>
            {BANNERS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: activeSlide === index ? "#c9a84c" : "rgba(255,255,255,0.4)" },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Scent Finder CTA Banner */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/scent-finder")}
          style={[styles.quizBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.quizInfo}>
            <Text style={[styles.quizTitle, { color: colors.text }]}>
              {t("আপনার প্রিয় সুবাস খুঁজুন", "Find Your Signature Scent")}
            </Text>
            <Text style={[styles.quizSubtitle, { color: colors.textSecondary }]}>
              {t("কুইজের মাধ্যমে মিলিয়ে নিন", "Take our interactive perfume quiz")}
            </Text>
          </View>
          <View style={[styles.quizBtn, { backgroundColor: colors.primary }]}>
            <ArrowRight size={16} color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
          </View>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#c9a84c" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Signature Collections */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("আইকনিক কালেকশন", "Signature Collections")}
              </Text>
            </View>
            <FlatList
              horizontal
              data={collections}
              keyExtractor={(item) => item._id}
              renderItem={renderCollectionItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collectionsList}
            />

            {/* Best Sellers / Featured Products */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("সেরা সুগন্ধি সমূহ", "Best Selling Fragrances")}
              </Text>
              <TouchableOpacity onPress={() => router.push("/shop")}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  {t("সব দেখুন", "See All")}
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={featured}
              keyExtractor={(item) => item._id}
              renderItem={renderProductItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />

            {/* The Scent Diary (Blog) */}
            {posts.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("সেন্ট ডায়েরি", "The Scent Diary")}
                  </Text>
                </View>
                <FlatList
                  horizontal
                  data={posts}
                  keyExtractor={(item) => item._id}
                  renderItem={renderPostItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.postsList}
                />
              </>
            )}

            {/* What Our Customers Say (Testimonials) */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("ক্রেতাদের মতামত", "What Our Customers Say")}
              </Text>
            </View>
            <FlatList
              horizontal
              data={TESTIMONIALS}
              keyExtractor={(item) => item.id}
              renderItem={renderTestimonialItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.testimonialsList}
            />
          </>
        )}
        
        {/* Footer info brand narrative */}
        <View style={[styles.brandNarrative, { borderColor: colors.border }]}>
          <Text style={[styles.narrativeTitle, { color: colors.primary }]}>
            {t("বিশুদ্ধতার গ্যারান্টি", "Pure & Premium Guarantee")}
          </Text>
          <Text style={[styles.narrativeText, { color: colors.textSecondary }]}>
            {t(
              "আমরা আপনাকে দিচ্ছি ১০০% আসল ও প্রিমিয়াম মানের সুগন্ধি যা আপনার ব্যক্তিত্বকে করবে আরো আকর্ষণীয়।",
              "We provide 100% genuine and premium grade fragrances that define and elevate your unique personality."
            )}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 2,
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  carouselContainer: {
    height: 180,
    marginHorizontal: 16,
    marginVertical: 16,
    position: "relative",
  },
  heroScrollView: {
    flex: 1,
  },
  heroBackgroundItem: {
    height: 180,
    overflow: "hidden",
  },
  dotContainer: {
    position: "absolute",
    bottom: 12,
    right: 16,
    flexDirection: "row",
    gap: 6,
    zIndex: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(28, 5, 7, 0.45)",
    padding: 16,
    justifyContent: "flex-end",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#c9a84c",
    fontFamily: "serif",
  },
  heroTagline: {
    fontSize: 12,
    color: "#e5ded4",
    marginTop: 4,
    marginBottom: 12,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  heroBtnText: {
    fontSize: 11,
    color: "#1c0507",
    fontWeight: "bold",
  },
  quizBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  quizSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  quizBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  collectionsList: {
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 24,
  },
  collectionCard: {
    width: width * 0.65,
    height: 120,
    marginRight: 12,
  },
  collectionBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  collectionOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(28, 5, 7, 0.4)",
    padding: 12,
    justifyContent: "flex-end",
    borderRadius: 12,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c9a84c",
    fontFamily: "serif",
  },
  collectionDesc: {
    fontSize: 10,
    color: "#e5ded4",
    marginTop: 2,
  },
  featuredList: {
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 24,
  },
  productCard: {
    width: width * 0.44,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
  },
  wishlistBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.75)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: "#c9a84c",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: "#1c0507",
    fontSize: 9,
    fontWeight: "bold",
  },
  productImage: {
    width: "100%",
    height: 140,
  },
  productInfo: {
    padding: 10,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: "bold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  ratingVal: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  oldPriceText: {
    fontSize: 10,
    color: "#888",
    textDecorationLine: "line-through",
  },
  buyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  postsList: {
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 24,
  },
  postCard: {
    width: width * 0.6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: 100,
  },
  postInfo: {
    padding: 10,
  },
  postCategory: {
    fontSize: 9.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 12.5,
    fontWeight: "bold",
    lineHeight: 18,
    height: 36,
  },
  postDate: {
    fontSize: 10,
    marginTop: 6,
  },
  testimonialsList: {
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 24,
  },
  testimonialCard: {
    width: width * 0.75,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginRight: 12,
  },
  testimonialQuote: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 18,
    height: 72,
  },
  testimonialAuthor: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 6,
  },
  brandNarrative: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },
  narrativeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    fontFamily: "serif",
  },
  narrativeText: {
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 18,
  },
});
