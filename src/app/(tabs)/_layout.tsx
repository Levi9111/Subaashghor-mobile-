import { Tabs, useRouter, usePathname } from "expo-router";
import { useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { Home, ShoppingBag, Sparkles, ShoppingCart, User } from "lucide-react-native";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { useState } from "react";

const TABS = ["/", "/shop", "/scent-finder", "/cart", "/account"];

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { count } = useCart();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  
  const [touchX, setTouchX] = useState(0);

  const handleTouchStart = (e: any) => {
    setTouchX(e.nativeEvent.pageX);
  };

  const handleTouchEnd = (e: any) => {
    const deltaX = e.nativeEvent.pageX - touchX;
    const swipeThreshold = 80; // optimal distance threshold for tab swipe

    if (Math.abs(deltaX) > swipeThreshold) {
      const currentIndex = TABS.indexOf(pathname);
      if (currentIndex !== -1) {
        if (deltaX < 0 && currentIndex < TABS.length - 1) {
          // Swipe Left -> Go to Next Tab
          router.replace(TABS[currentIndex + 1] as any);
        } else if (deltaX > 0 && currentIndex > 0) {
          // Swipe Right -> Go to Previous Tab
          router.replace(TABS[currentIndex - 1] as any);
        }
      }
    }
  };

  return (
    <View
      style={{ flex: 1 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Tabs
        screenOptions={{
          header: () => <Header />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom || 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("হোম", "Home"),
            tabBarIcon: ({ color, size, focused }) => (
              <Home color={color} size={size} fill={focused ? color : "none"} />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: t("শপ", "Shop"),
            headerTitle: t("সুবাসঘর শপ", "Subaashghor Shop"),
            tabBarIcon: ({ color, size, focused }) => (
              <ShoppingBag color={color} size={size} fill={focused ? color : "none"} />
            ),
          }}
        />
        <Tabs.Screen
          name="scent-finder"
          options={{
            title: t("সেন্ট ফাইন্ডার", "Scent Finder"),
            headerTitle: t("সেন্ট ফাইন্ডার কুইজ", "Scent Finder Quiz"),
            tabBarIcon: ({ color, size, focused }) => (
              <Sparkles color={color} size={size} fill={focused ? color : "none"} />
            ),
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
            tabBarIcon: ({ color, size, focused }) => (
              <ShoppingCart color={color} size={size} fill={focused ? color : "none"} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: t("প্রোফাইল", "Profile"),
            tabBarIcon: ({ color, size, focused }) => (
              <User color={color} size={size} fill={focused ? color : "none"} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
