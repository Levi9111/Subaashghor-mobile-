import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLang } from "@/lib/i18n";
import { Colors } from "@/constants/theme";
import { productsApi, Product, ProductListQuery } from "@/lib/api";
import { Search, SlidersHorizontal, Heart, Star, ShoppingBag, X } from "lucide-react-native";
import { useWishlist } from "@/lib/wishlist";

const { width } = Dimensions.get("window");

export default function ShopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, lang } = useLang();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const wishlist = useWishlist();

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: "", labelBn: "সব", labelEn: "All" },
    { id: "attar", labelBn: "আতর", labelEn: "Attar" },
    { id: "unisex", labelBn: "ইউনিসেক্স", labelEn: "Unisex" },
    { id: "men", labelBn: "পুরুষ", labelEn: "Men" },
    { id: "women", labelBn: "মহিলা", labelEn: "Women" },
  ];

  const sortOptions = [
    { id: "newest", labelBn: "নতুন সুবাস", labelEn: "Newest" },
    { id: "price-asc", labelBn: "মূল্য: কম থেকে বেশি", labelEn: "Price: Low to High" },
    { id: "price-desc", labelBn: "মূল্য: বেশি থেকে কম", labelEn: "Price: High to Low" },
  ];

  // Sync params if routed from collection/other link
  useEffect(() => {
    if (params.collection) {
      setSelectedCategory("");
    }
  }, [params.collection]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const query: ProductListQuery = {};
      if (searchQuery) query.q = searchQuery;
      if (selectedCategory) query.category = selectedCategory as any;
      if (params.collection) query.collection = params.collection as string;
      if (selectedSort) query.sort = selectedSort as any;

      const res = await productsApi.list(query);
      setProducts(res.items);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory, selectedSort, params.collection]);

  const renderProductItem = ({ item }: { item: Product }) => {
    const hasSale = item.salePrice && item.salePrice < item.price;
    const currentPrice = hasSale ? item.salePrice : item.price;

    return (
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
            size={16}
            color={wishlist.has(item.slug) ? "#d32f2f" : colors.muted}
            fill={wishlist.has(item.slug) ? "#d32f2f" : "none"}
          />
        </TouchableOpacity>

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
            <Star size={11} color="#c9a84c" fill="#c9a84c" />
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
              <ShoppingBag size={12} color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
      {/* Search Bar Row */}
      <View style={styles.searchRow}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={18} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            placeholder={t("আপনার সুবাস খুঁজুন...", "Search for perfumes...")}
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <SlidersHorizontal size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Expanded Filters Drawer (Accordion overlay styled) */}
      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
            {t("সাজানো (Sort By)", "Sort By")}
          </Text>
          <View style={styles.filterChipRow}>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setSelectedSort(opt.id)}
                style={[
                  styles.filterChip,
                  selectedSort === opt.id
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.backgroundElement },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSort === opt.id
                      ? { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }
                      : { color: colors.text },
                  ]}
                >
                  {lang === "bn" ? opt.labelBn : opt.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Categories chips horizontal scroll bar */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsContainer}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected
                      ? { color: scheme === "dark" ? "#1c0507" : "#e5ded4", fontWeight: "bold" }
                      : { color: colors.text },
                  ]}
                >
                  {lang === "bn" ? item.labelBn : item.labelEn}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Active Collection Filter Indicator */}
      {params.collection && (
        <View style={styles.activeFilterBar}>
          <Text style={[styles.activeFilterText, { color: colors.textSecondary }]}>
            {t("কালেকশন ফিল্টার: ", "Collection: ")}
            <Text style={{ fontWeight: "bold", color: colors.primary }}>{params.collection}</Text>
          </Text>
          <TouchableOpacity
            onPress={() => {
              router.setParams({ collection: "" });
            }}
          >
            <X size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Products list grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#c9a84c" style={{ flex: 1 }} />
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("কোনো সুগন্ধি খুঁজে পাওয়া যায়নি।", "No fragrances found matching filters.")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.productsContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: "100%",
    padding: 0,
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterPanel: {
    padding: 16,
    borderBottomWidth: 1,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  filterChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  categoriesWrapper: {
    height: 48,
    marginVertical: 8,
  },
  categoryChipsContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  activeFilterBar: {
    flexDirection: "row",
    backgroundColor: "rgba(201, 168, 76, 0.1)",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeFilterText: {
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  productsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: width * 0.45,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    marginHorizontal: width * 0.015,
    overflow: "hidden",
    position: "relative",
  },
  wishlistBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.75)",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 12.5,
    fontWeight: "bold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  ratingVal: {
    fontSize: 10,
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
    fontSize: 13.5,
    fontWeight: "bold",
  },
  oldPriceText: {
    fontSize: 9.5,
    color: "#888",
    textDecorationLine: "line-through",
  },
  buyBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
});
