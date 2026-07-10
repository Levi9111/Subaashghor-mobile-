import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLang } from "@/lib/i18n";
import { Colors } from "@/constants/theme";
import { CheckCircle2, Home, Package } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ThankYouScreen() {
  const { orderNumber } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLang();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        {/* Animated styled check circle */}
        <CheckCircle2 size={72} color="#2e7d32" style={styles.icon} />

        <Text style={[styles.title, { color: colors.text }]}>
          {t("ধন্যবাদ! আপনার অর্ডার সফল হয়েছে", "Thank You! Order Placed Successfully")}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t(
            "আমরা আপনার অর্ডারটি পেয়েছি এবং খুব শীঘ্রই এটি প্রসেসিং শুরু করবো।",
            "We have received your order and will start processing it shortly."
          )}
        </Text>

        {orderNumber && (
          <View style={[styles.orderNumberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.orderNumLabel, { color: colors.textSecondary }]}>
              {t("অর্ডার নম্বর (Order Number)", "Order Number")}
            </Text>
            <Text style={[styles.orderNumVal, { color: colors.primary }]}>{orderNumber}</Text>
          </View>
        )}

        {/* Action button triggers */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.replace("/")}
            style={[styles.actionBtn, { borderColor: colors.border, borderWidth: 1 }]}
          >
            <Home size={16} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>
              {t("হোম পেজে ফিরে যান", "Back to Home")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.replace("/account")}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          >
            <Package size={16} color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
            <Text style={[styles.actionBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
              {t("অর্ডার ট্র্যাক করুন", "Track Order")}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "serif",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  orderNumberCard: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
  },
  orderNumLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  orderNumVal: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  btnRow: {
    width: "100%",
    gap: 12,
  },
  actionBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 44,
    borderRadius: 22,
    gap: 8,
    width: "100%",
  },
  actionBtnText: {
    fontSize: 13.5,
    fontWeight: "bold",
  },
});
