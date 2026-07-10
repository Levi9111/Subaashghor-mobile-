import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/i18n";
import { Colors } from "@/constants/theme";
import { ordersApi, couponsApi, Coupon } from "@/lib/api";
import { Check, CreditCard, Landmark, Truck, ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, lang } = useLang();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const { user, isAuthenticated, defaultAddress } = useAuth();
  const { items, subtotal, clear } = useCart();

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash">("cod");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Coupon calculations
  const [couponCode, setCouponCode] = useState(params.coupon as string || "");
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    // Prefill user details if signed in
    if (isAuthenticated && user) {
      const def = defaultAddress();
      if (def) {
        setName(def.name);
        setPhone(def.phone);
        setStreet(def.address);
        setArea(def.area);
        setCity(def.city);
        setDistrict(def.district);
      } else {
        setName(user.name || "");
        setPhone(user.phone || "");
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (couponCode) {
      const validate = async () => {
        try {
          const res = await couponsApi.validate(couponCode, subtotal);
          setCoupon(res);
        } catch {
          setCoupon(null);
        }
      };
      validate();
    }
  }, [couponCode, subtotal]);

  const shippingFee = subtotal >= 3000 ? 0 : 130;
  
  let discount = 0;
  if (coupon) {
    discount = coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  }
  const total = Math.max(0, subtotal + shippingFee - discount);

  const handlePlaceOrder = async () => {
    setErrorMsg("");
    if (!name.trim() || !phone.trim() || !street.trim() || !city.trim() || !district.trim()) {
      setErrorMsg(t("সকল তারকাচিহ্নিত ক্ষেত্র পূরণ করুন", "Please fill in all required fields"));
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId || i.slug,
        slug: i.slug,
        name: i.name,
        image: i.image,
        ml: i.ml,
        price: i.price,
        qty: i.qty,
      }));

      const orderData = {
        items: orderItems,
        shipping: {
          name: name.trim(),
          phone: phone.trim(),
          address: street.trim(),
          area: area.trim() || "N/A",
          city: city.trim(),
          district: district.trim(),
        },
        paymentMethod,
        couponCode: coupon?.code,
      };

      const result = await ordersApi.create(orderData);
      
      // Clear Cart items
      clear();
      
      // Navigate to Thank you
      router.push(`/thank-you?orderNumber=${result.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || t("অর্ডার করতে সমস্যা হয়েছে।", "Failed to place order."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      {/* Custom SubHeader */}
      <View style={[styles.customHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("চেকআউট", "Checkout")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      
      {/* Shipping details */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("ডেলিভারি ঠিকানা", "Shipping Details")}
        </Text>

        <TextInput
          placeholder={t("নাম *", "Full Name *")}
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />

        <TextInput
          placeholder={t("মোবাইল নম্বর *", "Phone Number *")}
          placeholderTextColor={colors.muted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />

        <TextInput
          placeholder={t("রাস্তা / বাড়ি নং / গ্রাম *", "Street / House / Village *")}
          placeholderTextColor={colors.muted}
          value={street}
          onChangeText={setStreet}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />

        <TextInput
          placeholder={t("থানা / এলাকা (ঐচ্ছিক)", "Area / Police Station (Optional)")}
          placeholderTextColor={colors.muted}
          value={area}
          onChangeText={setArea}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />

        <TextInput
          placeholder={t("শহর *", "City / Town *")}
          placeholderTextColor={colors.muted}
          value={city}
          onChangeText={setCity}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />

        <TextInput
          placeholder={t("জেলা *", "District *")}
          placeholderTextColor={colors.muted}
          value={district}
          onChangeText={setDistrict}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />
      </View>

      {/* Payment methods selector */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("পেমেন্ট পদ্ধতি", "Payment Method")}
        </Text>

        <TouchableOpacity
          onPress={() => setPaymentMethod("cod")}
          style={[
            styles.paymentOption,
            { borderColor: colors.border },
            paymentMethod === "cod" && { borderColor: colors.primary },
          ]}
        >
          <View style={styles.optionLeft}>
            <Truck size={20} color={colors.primary} />
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              {t("ক্যাশ অন ডেলিভারি (COD)", "Cash on Delivery")}
            </Text>
          </View>
          <View style={[styles.radioDot, { borderColor: colors.border }, paymentMethod === "cod" && { backgroundColor: colors.primary }]} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPaymentMethod("bkash")}
          style={[
            styles.paymentOption,
            { borderColor: colors.border },
            paymentMethod === "bkash" && { borderColor: colors.primary },
          ]}
        >
          <View style={styles.optionLeft}>
            <Landmark size={20} color={colors.primary} />
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              {t("বিকাশ / অনলাইন পেমেন্ট", "bKash / Online Payment")}
            </Text>
          </View>
          <View style={[styles.radioDot, { borderColor: colors.border }, paymentMethod === "bkash" && { backgroundColor: colors.primary }]} />
        </TouchableOpacity>
      </View>

      {/* Checkout breakdown */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("হিসাব বিবরণী", "Order Summary")}
        </Text>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("উপমোট", "Subtotal")}</Text>
          <Text style={[styles.summaryVal, { color: colors.text }]}>৳{subtotal}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("ডেলিভারি চার্জ", "Shipping Fee")}</Text>
          <Text style={[styles.summaryVal, { color: colors.text }]}>
            {shippingFee === 0 ? t("ফ্রি", "FREE") : `৳${shippingFee}`}
          </Text>
        </View>

        {coupon && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t("কুপন ছাড় (", "Discount (")}{coupon.code})
            </Text>
            <Text style={[styles.summaryVal, { color: "#d32f2f" }]}>-৳{discount}</Text>
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>{t("সর্বমোট", "Grand Total")}</Text>
          <Text style={[styles.totalVal, { color: colors.primary }]}>৳{total}</Text>
        </View>
      </View>

      {errorMsg !== "" && <Text style={styles.errorText}>{errorMsg}</Text>}

      {/* Place Order CTA */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePlaceOrder}
        disabled={loading}
        style={[styles.orderBtn, { backgroundColor: colors.primary }]}
      >
        {loading ? (
          <ActivityIndicator color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
        ) : (
          <>
            <Check size={18} color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
            <Text style={[styles.orderBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
              {t("অর্ডার নিশ্চিত করুন", "Confirm Order")}
            </Text>
          </>
        )}
      </TouchableOpacity>

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
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
  divider: {
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
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  orderBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  orderBtnText: {
    fontSize: 14.5,
    fontWeight: "bold",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "serif",
    textAlign: "center",
    flex: 1,
  },
});
