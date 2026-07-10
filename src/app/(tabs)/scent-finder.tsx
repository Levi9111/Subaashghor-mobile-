import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  useColorScheme,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { useLang } from "@/lib/i18n";
import { Colors } from "@/constants/theme";
import { productsApi, Product } from "@/lib/api";
import { useRouter } from "expo-router";
import { useWishlist } from "@/lib/wishlist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Heart, Star, ShoppingBag, ArrowRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

type Answer = "fresh" | "warm" | "floral" | "woody";

interface Q {
  id: string;
  bn: string;
  en: string;
  opts: { value: Answer; bn: string; en: string }[];
}

const questions: Q[] = [
  {
    id: "mood",
    bn: "আপনার পছন্দের মুড?",
    en: "Your preferred mood?",
    opts: [
      { value: "fresh", bn: "তরতাজা ও হালকা", en: "Fresh & airy" },
      { value: "warm", bn: "উষ্ণ ও মিষ্টি", en: "Warm & sweet" },
      { value: "floral", bn: "ফুলেল ও রোমান্টিক", en: "Floral & romantic" },
      { value: "woody", bn: "কাঠের ও গভীর", en: "Woody & deep" },
    ],
  },
  {
    id: "occasion",
    bn: "কোন উপলক্ষ্য?",
    en: "What occasion?",
    opts: [
      { value: "fresh", bn: "প্রতিদিনের অফিস", en: "Daily office" },
      { value: "warm", bn: "সন্ধ্যার ডিনার", en: "Evening dinner" },
      { value: "floral", bn: "বিবাহ ও উৎসব", en: "Weddings & festivals" },
      { value: "woody", bn: "ব্যক্তিগত মুহূর্ত", en: "Personal moments" },
    ],
  },
  {
    id: "season",
    bn: "প্রিয় ঋতু?",
    en: "Favorite season?",
    opts: [
      { value: "fresh", bn: "গ্রীষ্ম", en: "Summer" },
      { value: "floral", bn: "বসন্ত", en: "Spring" },
      { value: "warm", bn: "শীত", en: "Winter" },
      { value: "woody", bn: "শরৎ", en: "Autumn" },
    ],
  },
  {
    id: "intensity",
    bn: "কতটা তীব্রতা?",
    en: "How intense?",
    opts: [
      { value: "fresh", bn: "মৃদু", en: "Subtle" },
      { value: "floral", bn: "মাঝারি", en: "Moderate" },
      { value: "warm", bn: "শক্তিশালী", en: "Strong" },
      { value: "woody", bn: "নাটকীয়", en: "Dramatic" },
    ],
  },
];

function pickWinner(answers: Answer[]): Answer {
  const counts: Record<Answer, number> = { fresh: 0, warm: 0, floral: 0, woody: 0 };
  answers.forEach((a) => counts[a]++);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Answer;
}

function recommend(winner: Answer, allProducts: Product[]) {
  const map: Record<Answer, string[]> = {
    woody: ["oud-royale", "midnight-saffron"],
    warm: ["midnight-saffron", "oud-royale"],
    floral: ["rose-musk", "jasmine-noir"],
    fresh: ["jasmine-noir", "rose-musk"],
  };
  return allProducts.filter((p) => map[winner].includes(p.slug));
}

export default function ScentFinderScreen() {
  const router = useRouter();
  const { t, lang } = useLang();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const wishlist = useWishlist();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [lead, setLead] = useState<{ name: string; email: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await productsApi.list({ limit: 100 });
        setAllProducts(res.items);
      } catch (err) {
        console.error("Error loading products for quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const done = step >= questions.length;
  const winner = done ? pickWinner(answers) : null;
  const matches = winner ? recommend(winner, allProducts) : [];

  const handleAnswer = (value: Answer) => {
    setAnswers([...answers, value]);
    setStep(step + 1);
  };

  const handleReset = () => {
    setAnswers([]);
    setStep(0);
    setLead(null);
    setName("");
    setEmail("");
  };

  const captureLead = async () => {
    if (!name.trim()) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;

    try {
      const existing = await AsyncStorage.getItem("sg-leads");
      const list = existing ? JSON.parse(existing) : [];
      list.push({
        source: "scent-finder",
        name: name.trim(),
        email: email.trim(),
        answers,
        at: new Date().toISOString(),
      });
      await AsyncStorage.setItem("sg-leads", JSON.stringify(list));
    } catch (err) {
      console.error(err);
    }
    setLead({ name: name.trim(), email: email.trim() });
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const hasSale = item.salePrice && item.salePrice < item.price;
    const currentPrice = hasSale ? item.salePrice : item.price;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/products/${item.slug}`)}
        style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
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

        <Image source={{ uri: item.images[0] }} style={styles.productImage} resizeMode="cover" />

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
          <View style={styles.priceRow}>
            <Text style={[styles.priceText, { color: colors.primary }]}>৳{currentPrice}</Text>
            {hasSale && <Text style={styles.oldPriceText}>৳{item.price}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#c9a84c" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={[styles.titleLabel, { color: colors.primary }]}>{t("সেন্ট ফাইন্ডার", "SCENT FINDER")}</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("আপনার সিগনেচার সুবাস", "Your Signature Scent")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("৪টি প্রশ্ন। ৬০ সেকেন্ড।", "4 questions. 60 seconds.")}
        </Text>
      </View>

      {!done ? (
        // Quiz Card
        <View style={[styles.quizCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Progress */}
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {t("প্রশ্ন", "Question")} {step + 1}/{questions.length}
            </Text>
            <View style={[styles.progressBarBase, { backgroundColor: colors.backgroundElement }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${((step + 1) / questions.length) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          {/* Question Text */}
          <Text style={[styles.questionText, { color: colors.text }]}>
            {lang === "bn" ? questions[step].bn : questions[step].en}
          </Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {questions[step].opts.map((opt) => (
              <TouchableOpacity
                key={opt.value + opt.en}
                activeOpacity={0.8}
                onPress={() => handleAnswer(opt.value)}
                style={[styles.optionBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.optionBtnText, { color: colors.text }]}>
                  {lang === "bn" ? opt.bn : opt.en}
                </Text>
                <ArrowRight size={16} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : !lead ? (
        // Lead Capture Screen
        <View style={[styles.leadCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.leadTitle, { color: colors.primary }]}>{t("প্রায় শেষ!", "Almost there!")}</Text>
          <Text style={[styles.leadSubtitle, { color: colors.textSecondary }]}>
            {t(
              "আপনার ম্যাচ + ১০% ছাড়ের কুপন ইমেইলে পেতে নাম ও ইমেইল দিন।",
              "Enter your name & email to unlock your matches and a 10% off coupon."
            )}
          </Text>

          <View style={styles.form}>
            <TextInput
              placeholder={t("নাম", "Name")}
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
            <TextInput
              placeholder={t("ইমেইল", "Email")}
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={captureLead}
              disabled={!name.trim() || !email.trim()}
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary, opacity: name.trim() && email.trim() ? 1 : 0.6 },
              ]}
            >
              <Text style={[styles.submitBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
                {t("আমার ম্যাচ দেখান", "Reveal My Matches")}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.spamText, { color: colors.muted }]}>
              {t("আমরা স্প্যাম পাঠাই না।", "We never spam — unsubscribe anytime.")}
            </Text>
          </View>
        </View>
      ) : (
        // Match Results Screen
        <View style={styles.resultsContainer}>
          <View style={[styles.leadCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 20 }]}>
            <Text style={[styles.leadTitle, { color: colors.primary }]}>
              {t("আপনার ম্যাচ পাওয়া গেছে", "Your matches are ready")}, {lead.name}
            </Text>
            <Text style={[styles.couponLabel, { color: colors.text }]}>
              {t("কুপন কোড: ", "Coupon code: ")}
              <Text style={{ fontWeight: "bold", color: "#c9a84c" }}>WELCOME10</Text>
            </Text>
            <TouchableOpacity onPress={handleReset} style={styles.retakeBtn}>
              <Text style={[styles.retakeBtnText, { color: colors.primary }]}>
                {t("আবার নিন (Retake Quiz)", "Retake Quiz")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Match Results list */}
          <FlatList
            data={matches}
            keyExtractor={(item) => item.slug}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            renderItem={renderProductItem}
          />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/shop")}
            style={[styles.shopAllBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.shopAllBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
              {t("সম্পূর্ণ সংগ্রহ দেখুন", "Browse Full Collection")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
  },
  titleLabel: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  quizCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressText: {
    fontSize: 12,
    marginRight: 12,
    fontWeight: "600",
  },
  progressBarBase: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "serif",
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  leadCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  leadTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "serif",
    textAlign: "center",
  },
  leadSubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  form: {
    width: "100%",
    marginTop: 20,
    gap: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 14,
  },
  submitBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  spamText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
  },
  resultsContainer: {
    width: "100%",
  },
  couponLabel: {
    fontSize: 14,
    marginTop: 10,
  },
  retakeBtn: {
    marginTop: 16,
  },
  retakeBtnText: {
    fontSize: 12,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  gridRow: {
    justifyContent: "space-between",
    marginHorizontal: -8,
  },
  productCard: {
    width: (width - 48) / 2,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    marginHorizontal: 8,
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
    height: 120,
  },
  productInfo: {
    padding: 8,
  },
  categoryText: {
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  productName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  priceText: {
    fontSize: 12.5,
    fontWeight: "bold",
  },
  oldPriceText: {
    fontSize: 9.5,
    color: "#888",
    textDecorationLine: "line-through",
  },
  shopAllBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  shopAllBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
