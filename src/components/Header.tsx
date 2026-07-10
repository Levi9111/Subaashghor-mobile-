import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sun, Moon, Globe } from "lucide-react-native";
import { useLang } from "@/lib/i18n";
import { useThemeToggle, useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export function Header() {
  const insets = useSafeAreaInsets();
  const { lang, toggle: toggleLang, t } = useLang();
  const { toggleTheme } = useThemeToggle();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Brand Identity */}
        <View style={styles.brand}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.brandName, { color: colors.primary }]}>
              {t("সুবাসঘর", "Subaashghor")}
            </Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
              {t("খাঁটি সুবাসের ঘর", "House of Pure Fragrance")}
            </Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actions}>
          {/* Language Toggle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleLang}
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Globe size={14} color={colors.primary} />
            <Text style={[styles.btnText, { color: colors.text }]}>
              {lang === "bn" ? "EN" : "বাংলা"}
            </Text>
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleTheme}
            style={[
              styles.themeBtn,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            {scheme === "dark" ? (
              <Sun size={16} color="#c9a84c" />
            ) : (
              <Moon size={16} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brandName: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "serif",
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 9,
    letterSpacing: 0.2,
    marginTop: -2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  themeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
