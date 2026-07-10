import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLang } from "@/lib/i18n";
import { Colors } from "@/constants/theme";
import { productsApi, reviewsApi, Product, Review, Size } from "@/lib/api";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Heart, Star, ShoppingCart, MessageSquare, Send } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const { t, lang } = useLang();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const wishlist = useWishlist();
  const cart = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);

  const { user } = useAuth();

  // New review state
  const [reviewName, setReviewName] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (slug) {
      const loadProductData = async () => {
        try {
          const prod = await productsApi.get(slug as string);
          setProduct(prod);
          const revs = await reviewsApi.listForProduct({ productId: prod._id });
          setReviews(revs);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadProductData();
    }
  }, [slug]);

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#c9a84c" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{t("পণ্যটি পাওয়া যায়নি।", "Product not found.")}</Text>
      </View>
    );
  }

  const selectedSize = product.sizes[selectedSizeIdx] || product.sizes[0];
  const hasSale = !!(selectedSize.salePrice && selectedSize.salePrice < selectedSize.price);
  const currentPrice = hasSale && selectedSize.salePrice ? selectedSize.salePrice : selectedSize.price;

  const handleAddToCart = () => {
    cart.add({
      slug: product.slug,
      name: lang === "bn" ? product.name.bn : product.name.en,
      image: product.images[0],
      ml: selectedSize.ml,
      price: currentPrice,
      qty: 1,
    });
    router.push("/cart");
  };

  const handleCreateReview = async () => {
    if (!reviewName.trim() || !reviewBody.trim()) return;
    setSubmittingReview(true);
    try {
      const newRev = await reviewsApi.create({
        productId: product._id,
        userId: user?.email || "guest",
        userName: reviewName.trim(),
        rating: reviewRating,
        body: reviewBody.trim(),
      });
      setReviews([newRev, ...reviews]);
      setReviewName("");
      setReviewBody("");
      setReviewRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images[0] }} style={styles.productImage} resizeMode="cover" />
        
        {/* Wishlist toggle */}
        <TouchableOpacity
          onPress={() => wishlist.toggle(product.slug)}
          style={[styles.wishlistBtn, { backgroundColor: colors.card }]}
        >
          <Heart
            size={22}
            color={wishlist.has(product.slug) ? "#d32f2f" : colors.muted}
            fill={wishlist.has(product.slug) ? "#d32f2f" : "none"}
          />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.infoWrapper}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>
            {lang === "bn" ? product.name.bn : product.name.en}
          </Text>
          <View style={styles.ratingRow}>
            <Star size={16} color="#c9a84c" fill="#c9a84c" />
            <Text style={[styles.ratingVal, { color: colors.text }]}>{product.rating?.toFixed(1) || "5.0"}</Text>
            <Text style={[styles.reviewCount, { color: colors.muted }]}>({product.reviewCount || 0})</Text>
          </View>
        </View>

        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          {lang === "bn" ? product.tagline?.bn : product.tagline?.en}
        </Text>

        {/* Pricing */}
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>৳{currentPrice}</Text>
          {hasSale && <Text style={styles.oldPrice}>৳{selectedSize.price}</Text>}
        </View>

        {/* Sizes Selector */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("সাইজ নির্বাচন করুন", "Select Size")}</Text>
          <View style={styles.sizeChipsRow}>
            {product.sizes.map((sz: Size, idx: number) => (
              <TouchableOpacity
                key={sz.ml}
                onPress={() => setSelectedSizeIdx(idx)}
                style={[
                  styles.sizeChip,
                  selectedSizeIdx === idx
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.sizeChipText,
                    selectedSizeIdx === idx
                      ? { color: scheme === "dark" ? "#1c0507" : "#e5ded4", fontWeight: "bold" }
                      : { color: colors.text },
                  ]}
                >
                  {sz.ml} ml
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes (Top, Heart, Base) */}
        <View style={[styles.notesContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.notesTitle, { color: colors.text }]}>
            {t("সেন্ট নোটস (Scent Notes)", "Scent Notes")}
          </Text>

          <View style={styles.noteRow}>
            <Text style={[styles.noteLabel, { color: colors.primary }]}>{t("টপ নোট (Top):", "Top:")}</Text>
            <Text style={[styles.noteValue, { color: colors.textSecondary }]}>{product.notes.top.join(", ")}</Text>
          </View>
          <View style={styles.noteRow}>
            <Text style={[styles.noteLabel, { color: colors.primary }]}>{t("হার্ট নোট (Heart):", "Heart:")}</Text>
            <Text style={[styles.noteValue, { color: colors.textSecondary }]}>{product.notes.heart.join(", ")}</Text>
          </View>
          <View style={styles.noteRow}>
            <Text style={[styles.noteLabel, { color: colors.primary }]}>{t("বেস নোট (Base):", "Base:")}</Text>
            <Text style={[styles.noteValue, { color: colors.textSecondary }]}>{product.notes.base.join(", ")}</Text>
          </View>
        </View>

        {/* Add to Cart button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleAddToCart}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <ShoppingCart size={18} color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
          <Text style={[styles.addBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
            {t("কার্টে যুক্ত করুন", "Add to Cart")}
          </Text>
        </TouchableOpacity>

        {/* Reviews Section */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("রিভিউ সমূহ", "Reviews")}</Text>

          {/* New review form */}
          <View style={[styles.reviewForm, { borderColor: colors.border }]}>
            <Text style={[styles.reviewFormTitle, { color: colors.text }]}>{t("আপনার মতামত লিখুন", "Write a Review")}</Text>
            <TextInput
              placeholder={t("আপনার নাম", "Your Name")}
              placeholderTextColor={colors.muted}
              value={reviewName}
              onChangeText={setReviewName}
              style={[styles.reviewInput, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder={t("আপনার অনুভূতি প্রকাশ করুন...", "Tell us about your experience...")}
              placeholderTextColor={colors.muted}
              multiline
              value={reviewBody}
              onChangeText={setReviewBody}
              style={[styles.reviewInput, styles.reviewTextArea, { color: colors.text, borderColor: colors.border }]}
            />

            {/* Rating selector */}
            <View style={styles.reviewRatingRow}>
              <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>{t("রেটিং: ", "Rating: ")}</Text>
              {[1, 2, 3, 4, 5].map((starVal) => (
                <TouchableOpacity key={starVal} onPress={() => setReviewRating(starVal)}>
                  <Star
                    size={20}
                    color="#c9a84c"
                    fill={reviewRating >= starVal ? "#c9a84c" : "none"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleCreateReview}
              disabled={submittingReview || !reviewName.trim() || !reviewBody.trim()}
              style={[styles.reviewSubmitBtn, { backgroundColor: colors.primary }]}
            >
              <Send size={14} color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
              <Text style={[styles.reviewSubmitBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
                {t("জমা দিন", "Submit Review")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <Text style={[styles.emptyReviews, { color: colors.muted }]}>
              {t("কোনো রিভিউ নেই। প্রথম রিভিউটি লিখুন!", "No reviews yet. Be the first to review!")}
            </Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev._id} style={[styles.reviewCard, { borderBottomColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewerName, { color: colors.text }]}>{rev.userName}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={11} color="#c9a84c" fill="#c9a84c" />
                    ))}
                  </View>
                </View>
                {rev.title && <Text style={[styles.reviewTitleText, { color: colors.text }]}>{rev.title}</Text>}
                <Text style={[styles.reviewBody, { color: colors.textSecondary }]}>{rev.body}</Text>
                <Text style={[styles.reviewDate, { color: colors.muted }]}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  imageContainer: {
    position: "relative",
    width: width,
    height: 320,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  wishlistBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  infoWrapper: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "serif",
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingVal: {
    fontSize: 14,
    fontWeight: "bold",
  },
  reviewCount: {
    fontSize: 12,
  },
  tagline: {
    fontSize: 13,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 12,
    gap: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
  },
  oldPrice: {
    fontSize: 14,
    color: "#888",
    textDecorationLine: "line-through",
  },
  sectionMargin: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sizeChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  sizeChipText: {
    fontSize: 13,
  },
  notesContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  noteRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  noteLabel: {
    fontSize: 12.5,
    fontWeight: "bold",
    width: 90,
  },
  noteValue: {
    fontSize: 12.5,
    flex: 1,
  },
  addBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  reviewForm: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  reviewFormTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
  },
  reviewInput: {
    height: 38,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 12.5,
    marginBottom: 10,
  },
  reviewTextArea: {
    height: 70,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  ratingLabel: {
    fontSize: 12.5,
  },
  reviewSubmitBtn: {
    height: 38,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  reviewSubmitBtnText: {
    fontSize: 12.5,
    fontWeight: "bold",
  },
  emptyReviews: {
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 16,
  },
  reviewCard: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    fontSize: 12.5,
    fontWeight: "bold",
  },
  starsRow: {
    flexDirection: "row",
  },
  reviewTitleText: {
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: 4,
  },
  reviewBody: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  reviewDate: {
    fontSize: 9.5,
    marginTop: 4,
  },
});
