import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { WelcomeSplash } from "@/components/WelcomeSplash";

// Keep the native splash screen visible until we mount the app layout
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the native splash screen immediately, since our custom WelcomeSplash will take over
    SplashScreen.hideAsync();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <View style={{ flex: 1 }}>
              {/* Stack navigator containing all route pages */}
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="products/[slug]"
                  options={{
                    headerShown: true,
                    headerTitle: "Product Details",
                    headerBackTitle: "Back",
                  }}
                />
                <Stack.Screen
                  name="checkout"
                  options={{
                    headerShown: true,
                    headerTitle: "Checkout",
                    headerBackTitle: "Back",
                  }}
                />
                <Stack.Screen
                  name="thank-you"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>

              {/* Luxury Welcome Splash overlay */}
              <WelcomeSplash />
            </View>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
