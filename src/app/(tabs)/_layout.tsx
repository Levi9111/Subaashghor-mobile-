import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import { Home, ShoppingBag, Sparkles, ShoppingCart, User } from "lucide-react-native";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/i18n";

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { count } = useCart();
  const { t } = useLang();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
          fontFamily: "serif",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("হোম", "Home"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t("শপ", "Shop"),
          headerTitle: t("সুবাসঘর শপ", "Subaashghor Shop"),
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scent-finder"
        options={{
          title: t("সেন্ট ফাইন্ডার", "Scent Finder"),
          headerTitle: t("সেন্ট ফাইন্ডার কুইজ", "Scent Finder Quiz"),
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t("কার্ট", "Cart"),
          headerTitle: t("শপিং কার্ট", "Shopping Cart"),
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#c9a84c",
            color: "#1c0507",
            fontSize: 10,
            lineHeight: 14,
          },
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t("প্রোফাইল", "Profile"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
