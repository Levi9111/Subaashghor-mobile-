import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  useColorScheme,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart, CartItem } from "@/lib/cart";
import { useLang } from "@/lib/i18n";
import { Colors } from "@/constants/theme";
import { couponsApi } from "@/lib/api";
import { useRouter } from "expo-router";
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingCart } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function CartScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  
  const { items, setQty, remove, subtotal, clear } = useCart();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const shippingFee = subtotal >= 3000 || subtotal === 0 ? 0 : 130;
  
  let discount = 0;
  if (activeCoupon) {
    discount = activeCoupon.type === "percent"
      ? Math.round((subtotal * activeCoupon.value) / 100)
      : activeCoupon.value;
  }
  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponSuccess("");
    try {
      const c = await couponsApi.validate(couponCode.trim(), subtotal);
      setActiveCoupon({ code: c.code, type: c.type, value: c.value });
      setCouponSuccess(t("কুপন সফলভাবে প্রয়োগ করা হয়েছে!", "Coupon applied successfully!"));
    } catch (err: any) {
      setCouponError(err.message || t("অকার্যকর কুপন কোড।", "Invalid coupon code."));
      setActiveCoupon(null);
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  const renderCartItem = (item: CartItem) => {
    return (
      <View
        key={item.slug + item.ml}
        style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.itemSize, { color: colors.muted }]}>{item.ml}ml</Text>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>৳{item.price}</Text>

          {/* Qty controller */}
          <View style={styles.qtyRow}>
            <View style={[styles.qtyContainer, { borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setQty(item.slug, item.ml, item.qty - 1)}
                style={styles.qtyBtn}
              >
                <Minus size={14} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.text }]}>{item.qty}</Text>
              <TouchableOpacity
                onPress={() => setQty(item.slug, item.ml, item.qty + 1)}
                style={styles.qtyBtn}
              >
                <Plus size={14} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* RemoveBtn */}
            <TouchableOpacity
              onPress={() => remove(item.slug, item.ml)}
              style={styles.removeBtn}
            >
              <Trash2 size={16} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.emptyRoot, { backgroundColor: colors.background }]}>
        <ShoppingCart size={64} color={colors.muted} style={{ marginBottom: 16 }} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          {t("আপনার কার্ট খালি!", "Your cart is empty!")}
        </Text>
        <Text style={[styles.emptySub, { color: colors.muted }]}>
          {t("আমাদের চমৎকার সুগন্ধিগুলো ঘুরে দেখুন", "Add premium fragrances to get started")}
        </Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/shop")}
          style={[styles.shopBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.shopBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
            {t("শপ এ যান", "Go to Shop")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Cart Items list */}
        <View style={styles.listContainer}>{items.map(renderCartItem)}</View>

        {/* Coupon Input box */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("কুপন কোড", "Apply Coupon")}
          </Text>
          {activeCoupon ? (
            <View style={[styles.appliedCoupon, { backgroundColor: colors.backgroundElement }]}>
              <Tag size={16} color="#c9a84c" />
              <Text style={[styles.appliedCouponText, { color: colors.text }]}>
                {activeCoupon.code} ({activeCoupon.type === "percent" ? `${activeCoupon.value}% off` : `৳${activeCoupon.value} off`})
              </Text>
              <TouchableOpacity onPress={removeCoupon}>
                <Text style={styles.removeCouponText}>{t("মুছুন", "Remove")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextInput
                placeholder={t("কুপন কোড লিখুন", "Enter code (e.g. WELCOME10)")}
                placeholderTextColor={colors.muted}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                style={[styles.couponInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TouchableOpacity
                onPress={applyCoupon}
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.applyBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
                  {t("প্রয়োগ", "Apply")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {couponError !== "" && <Text style={styles.errorText}>{couponError}</Text>}
          {couponSuccess !== "" && <Text style={styles.successText}>{couponSuccess}</Text>}
        </View>

        {/* Calculation summary */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("হিসাব সংক্ষেপ", "Order Summary")}
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t("উপমোট (Subtotal)", "Subtotal")}
            </Text>
            <Text style={[styles.summaryVal, { color: colors.text }]}>৳{subtotal}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t("ডেলিভারি চার্জ", "Shipping Fee")}
            </Text>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              {shippingFee === 0 ? t("ফ্রি", "FREE") : `৳${shippingFee}`}
            </Text>
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t("ছাড় (Discount)", "Discount")}
              </Text>
              <Text style={[styles.summaryVal, { color: "#d32f2f" }]}>-৳{discount}</Text>
            </View>
          )}

          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              {t("সর্বমোট (Grand Total)", "Grand Total")}
            </Text>
            <Text style={[styles.totalVal, { color: colors.primary }]}>৳{grandTotal}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/checkout",
              params: {
                coupon: activeCoupon?.code || "",
              },
            })
          }
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.checkoutBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
            {t("অর্ডার করতে এগিয়ে যান", "Proceed to Checkout")}
          </Text>
          <ArrowRight size={18} color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "serif",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
  },
  shopBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopBtnText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  listContainer: {
    marginBottom: 16,
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  itemSize: {
    fontSize: 11,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13.5,
    fontWeight: "bold",
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    height: 28,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    width: 28,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
  removeBtn: {
    padding: 4,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  couponRow: {
    flexDirection: "row",
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 13,
  },
  applyBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
  },
  applyBtnText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  appliedCoupon: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    justifyContent: "space-between",
  },
  appliedCouponText: {
    fontSize: 12.5,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
  },
  removeCouponText: {
    color: "#d32f2f",
    fontSize: 12,
    fontWeight: "bold",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 11.5,
    marginTop: 6,
    marginLeft: 4,
  },
  successText: {
    color: "#2e7d32",
    fontSize: 11.5,
    marginTop: 6,
    marginLeft: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryDivider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalVal: {
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  checkoutBtnText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
