import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text, StatusBar, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useLang } from "@/lib/i18n";

const { width, height } = Dimensions.get("window");

export function WelcomeSplash() {
  const { t } = useLang();
  const [visible, setVisible] = useState(true);

  // Shared Animation Values
  const rootOpacity = useSharedValue(1);
  const ringRotation = useSharedValue(0);
  const contentScale = useSharedValue(0.7);
  const contentOpacity = useSharedValue(0);
  
  useEffect(() => {
    // 1. Continuous slow rotation of the gold ring
    ringRotation.value = withRepeat(
      withTiming(360, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // 2. Sequential entry animations
    contentScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.quad),
    });
    contentOpacity.value = withTiming(1, {
      duration: 1000,
    });

    // 3. Exit animation trigger at 3.2s
    const exitTimer = setTimeout(() => {
      rootOpacity.value = withTiming(0, {
        duration: 800,
        easing: Easing.inOut(Easing.quad),
      }, () => {
        runOnJS(setVisible)(false);
      });
    }, 3200);

    return () => clearTimeout(exitTimer);
  }, []);

  if (!visible) return null;

  // Animated styles
  const rootAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rootOpacity.value,
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  return (
    <Animated.View style={[styles.root, rootAnimatedStyle]} pointerEvents="none">
      <StatusBar barStyle="light-content" backgroundColor="#1c0507" />
      {/* Background with luxury gradient feeling */}
      <View style={styles.bgBase} />
      <View style={styles.bgGlow} />
      
      {/* Corner Ornaments */}
      <OrnamentCorner position="tl" />
      <OrnamentCorner position="tr" flipX />
      <OrnamentCorner position="bl" flipY />
      <OrnamentCorner position="br" flipX flipY />

      {/* Floating Gold Particles (Static representation for mobile performance/premium look) */}
      <View style={styles.particlesContainer}>
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${(i * 37 + 7) % 100}%`,
                top: `${(i * 29 + 13) % 100}%`,
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
                opacity: i % 2 === 0 ? 0.8 : 0.4,
              },
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <View style={styles.logoWrapper}>
          {/* Rotating ring */}
          <Animated.View style={[styles.ringContainer, ringAnimatedStyle]}>
            <Svg width="180" height="180" viewBox="0 0 160 160">
              <Circle cx="80" cy="80" r="74" stroke="rgba(201,168,76,0.15)" strokeWidth="0.5" />
              <Circle
                cx="80"
                cy="80"
                r="74"
                stroke="#c9a84c"
                strokeWidth="0.8"
                strokeDasharray="2 14"
                opacity="0.6"
              />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const x = 80 + 74 * Math.sin(rad);
                const y = 80 - 74 * Math.cos(rad);
                return (
                  <Rect
                    key={i}
                    x={x - 2.5}
                    y={y - 2.5}
                    width="5"
                    height="5"
                    transform={`rotate(45 ${x} ${y})`}
                    fill="#c9a84c"
                    opacity={i % 2 === 0 ? 0.8 : 0.4}
                  />
                );
              })}
            </Svg>
          </Animated.View>

          {/* Logo inner circle */}
          <View style={styles.logoCircle}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 84, height: 84 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Brand Names */}
        <Text style={styles.titleBn}>{t("সুবাসঘর", "Subaashghor")}</Text>
        <Text style={styles.titleEn}>Subaashghor</Text>

        {/* Rule Diamond Divider */}
        <View style={styles.ruleContainer}>
          <View style={styles.ruleLine} />
          <View style={styles.ruleDiamond} />
          <View style={styles.ruleGem} />
          <View style={styles.ruleDiamond} />
          <View style={styles.ruleLine} />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          {t("একটি বিশুদ্ধ সুবাসের ঐতিহ্য", "A Legacy of Pure Fragrance")}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

function OrnamentCorner({
  position,
  flipX,
  flipY,
}: {
  position: "tl" | "tr" | "bl" | "br";
  flipX?: boolean;
  flipY?: boolean;
}) {
  const getStyle = () => {
    switch (position) {
      case "tl":
        return { top: 20, left: 20 };
      case "tr":
        return { top: 20, right: 20 };
      case "bl":
        return { bottom: 20, left: 20 };
      case "br":
        return { bottom: 20, right: 20 };
    }
  };

  const transform = [
    flipX && { scaleX: -1 },
    flipY && { scaleY: -1 },
  ].filter(Boolean) as any[];

  return (
    <View style={[styles.corner, getStyle()]}>
      <Svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        style={transform.length > 0 ? { transform } : undefined}
      >
        <Path
          d="M8 8 L8 46 M8 8 L46 8"
          stroke="#c9a84c"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <Path d="M8 32 Q8 8 32 8" stroke="#c9a84c" strokeWidth="0.8" fill="none" opacity="0.5" />
        <Path d="M8 22 Q8 8 22 8" stroke="#c9a84c" strokeWidth="0.5" fill="none" opacity="0.3" />
        <Circle cx="8" cy="8" r="3" fill="#c9a84c" opacity="0.9" />
        <Circle cx="26" cy="8" r="1.5" fill="#c9a84c" opacity="0.5" />
        <Circle cx="8" cy="26" r="1.5" fill="#c9a84c" opacity="0.5" />
        <Path
          d="M18 18 Q26 18 26 26 Q26 18 34 18 M18 18 Q18 26 26 26 Q18 26 18 34"
          stroke="#c9a84c"
          strokeWidth="0.6"
          fill="none"
          opacity="0.4"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c0507", // Deep luxury maroon
  },
  bgBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#1c0507",
  },
  bgGlow: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    backgroundColor: "rgba(201, 168, 76, 0.08)", // subtle gold glow center
  },
  corner: {
    position: "absolute",
  },
  particlesContainer: {
    ...StyleSheet.absoluteFill,
  },
  particle: {
    position: "absolute",
    backgroundColor: "#c9a84c",
    borderRadius: 2,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  ringContainer: {
    position: "absolute",
    width: 180,
    height: 180,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#29090c",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.3)",
    shadowColor: "#c9a84c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoChar: {
    fontSize: 48,
    color: "#c9a84c",
    fontWeight: "bold",
    fontFamily: "serif",
  },
  titleBn: {
    fontSize: 32,
    fontWeight: "800",
    color: "#c9a84c",
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: "serif",
  },
  titleEn: {
    fontSize: 16,
    color: "#a59e95",
    letterSpacing: 6,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  ruleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    width: width * 0.5,
    justifyContent: "center",
  },
  ruleLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201, 168, 76, 0.25)",
  },
  ruleDiamond: {
    width: 6,
    height: 6,
    backgroundColor: "rgba(201, 168, 76, 0.4)",
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 6,
  },
  ruleGem: {
    width: 10,
    height: 10,
    backgroundColor: "#c9a84c",
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 6,
  },
  tagline: {
    fontSize: 13,
    color: "#c9a84c",
    letterSpacing: 1.5,
    marginTop: 8,
    textAlign: "center",
    fontFamily: "serif",
  },
});
