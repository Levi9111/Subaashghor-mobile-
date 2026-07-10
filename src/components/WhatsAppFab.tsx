import React from "react";
import { TouchableOpacity, StyleSheet, Linking, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function WhatsAppFab() {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    const phoneNumber = "8801711000000";
    const text = "Hello Subaashghor! I have a question.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch((err) => console.error("Failed to open WhatsApp:", err));
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.fab,
        {
          bottom: 75 + insets.bottom, // dynamically floats above the bottom tab bar
        },
      ]}
    >
      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12.012 2C6.485 2 2 6.485 2 12.012c0 1.83.493 3.568 1.353 5.091L2 22l5.033-1.321a9.98 9.98 0 0 0 4.979 1.333c5.527 0 10.012-4.485 10.012-10.012C22.024 6.485 17.539 2 12.012 2zm0 18.358a8.312 8.312 0 0 1-4.254-1.164l-.305-.182-3.161.829.843-3.08-.2-.318A8.324 8.324 0 0 1 3.654 12c0-4.606 3.752-8.358 8.358-8.358 4.606 0 8.358 3.752 8.358 8.358 0 4.606-3.752 8.358-8.358 8.358z"
          fill="#ffffff"
        />
        <Path
          d="M16.486 13.912c-.244-.122-1.442-.712-1.666-.793-.223-.081-.387-.122-.55.122-.162.244-.63.793-.772.955-.143.163-.285.183-.529.061-.244-.122-1.03-.38-1.962-1.211-.725-.647-1.214-1.447-1.356-1.691-.142-.244-.015-.376.107-.497.11-.11.244-.285.366-.427.122-.143.163-.244.244-.407.081-.163.041-.305-.02-.427-.061-.122-.55-1.324-.753-1.812-.198-.478-.399-.413-.55-.421-.143-.008-.306-.008-.468-.008-.163 0-.427.061-.65.305-.224.244-.854.834-.854 2.035 0 1.201.875 2.361.996 2.524.122.163 1.722 2.629 4.172 3.687.583.252 1.038.402 1.393.515.586.186 1.12.16 1.542.097.471-.071 1.442-.589 1.645-1.159.203-.57.203-1.058.142-1.159-.06-.1-.223-.162-.467-.284z"
          fill="#ffffff"
        />
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#25D366", // Official WhatsApp Green
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
});
