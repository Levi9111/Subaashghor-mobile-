import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, Address } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { Colors } from "@/constants/theme";
import { ordersApi, Order, productsApi, Product } from "@/lib/api";
import { useWishlist } from "@/lib/wishlist";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  LogOut,
  MapPin,
  Package,
  Plus,
  Trash2,
  Check,
  Globe,
  User,
  Heart,
  ShoppingBag,
  Star,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function AccountScreen() {
  const router = useRouter();
  const { t, lang, toggle: toggleLang } = useLang();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const wishlist = useWishlist();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    login,
    register,
    logout,
    updateProfile,
    upsertAddress,
    removeAddress,
    setDefaultAddress,
  } = useAuth();

  // Screen Sub-Tabs for Authenticated Dashboard
  const [activeTab, setActiveTab] = useState<"profile" | "wishlist" | "addresses" | "orders">("profile");

  // Auth form inputs (Unauthenticated view)
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Profile Edit fields (Authenticated view)
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Orders list
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Products list (for resolving Wishlist info)
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Address modal inputs
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrLabel, setAddrLabel] = useState("");
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrArea, setAddrArea] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrDistrict, setAddrDistrict] = useState("");
  const [addrDefault, setAddrDefault] = useState(false);

  // Populate form fields with user data on load/change
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  // Load orders & products on authentication
  useEffect(() => {
    if (isAuthenticated) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const list = await ordersApi.mine();
          setOrders(list);
        } catch (err) {
          console.error("Failed to load orders:", err);
        } finally {
          setOrdersLoading(false);
        }
      };

      const loadProducts = async () => {
        setProductsLoading(true);
        try {
          const res = await productsApi.list({ limit: 100 });
          setAllProducts(res.items);
        } catch (err) {
          console.error("Failed to load products for wishlist:", err);
        } finally {
          setProductsLoading(false);
        }
      };

      fetchOrders();
      loadProducts();
    }
  }, [isAuthenticated]);

  const handleAuth = async () => {
    setErrorMsg("");
    if (!emailOrPhone.trim()) {
      setErrorMsg(t("ইমেল বা ফোন লিখুন", "Please enter email or phone"));
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg(t("পাসওয়ার্ড ন্যূনতম ৬ অক্ষর হতে হবে", "Password must be at least 6 characters"));
      return;
    }

    setLoading(true);
    try {
      if (authTab === "login") {
        await login(emailOrPhone.trim(), password);
      } else {
        if (!name.trim()) {
          setErrorMsg(t("দয়া করে নাম লিখুন", "Please enter your name"));
          setLoading(false);
          return;
        }
        const isPhone = /^(?:\+8801|01)[3-9]\d{8}$/.test(emailOrPhone.trim()) || /^\d+$/.test(emailOrPhone.trim());
        const signupPayload = {
          name: name.trim(),
          email: isPhone ? "" : emailOrPhone.trim().toLowerCase(),
          phone: isPhone ? emailOrPhone.trim() : phone.trim(),
          password,
        };
        await register(signupPayload);
      }
    } catch (err: any) {
      setErrorMsg(err.message || t("অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে।", "An error occurred."));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileSuccessMsg("");
    setErrorMsg("");
    if (!profileName.trim()) {
      setErrorMsg(t("নাম খালি হতে পারে না", "Name cannot be empty"));
      return;
    }
    setUpdatingProfile(true);
    try {
      await updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
      });
      setProfileSuccessMsg(t("প্রোফাইল সফলভাবে আপডেট করা হয়েছে", "Profile updated successfully"));
      setTimeout(() => setProfileSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || t("আপডেট ব্যর্থ হয়েছে।", "Update failed."));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = () => {
    if (!addrName.trim() || !addrPhone.trim() || !addrStreet.trim() || !addrCity.trim() || !addrDistrict.trim()) {
      return;
    }
    const newAddr: Address = {
      label: addrLabel.trim() || "Home",
      name: addrName.trim(),
      phone: addrPhone.trim(),
      address: addrStreet.trim(),
      area: addrArea.trim() || "N/A",
      city: addrCity.trim(),
      district: addrDistrict.trim(),
      isDefault: addrDefault,
    };
    upsertAddress(newAddr);
    setShowAddressModal(false);
    
    // reset address states
    setAddrLabel("");
    setAddrName("");
    setAddrPhone("");
    setAddrStreet("");
    setAddrArea("");
    setAddrCity("");
    setAddrDistrict("");
    setAddrDefault(false);
  };

  if (authLoading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#c9a84c" />
      </View>
    );
  }

  // Filter products in wishlist
  const wishlistProducts = allProducts.filter((p) => wishlist.has(p.slug));

  // ----- UNAUTHENTICATED VIEW -----
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          {/* Brand header */}
          <View style={styles.authHeader}>
            <Text style={[styles.logoText, { color: colors.primary }]}>
              {t("সুবাসঘর", "Subaashghor")}
            </Text>
            <Text style={[styles.logoSub, { color: colors.textSecondary }]}>
              {t("একটি বিশুদ্ধ সুবাসের ঐতিহ্য", "A Legacy of Pure Fragrance")}
            </Text>
          </View>

          {/* Toggle Tabs */}
          <View style={[styles.tabsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => { setAuthTab("login"); setErrorMsg(""); }}
              style={[styles.tabBtn, authTab === "login" && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.tabBtnText, { color: authTab === "login" ? (scheme === "dark" ? "#1c0507" : "#e5ded4") : colors.text }]}>
                {t("লগইন", "Login")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setAuthTab("signup"); setErrorMsg(""); }}
              style={[styles.tabBtn, authTab === "signup" && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.tabBtnText, { color: authTab === "signup" ? (scheme === "dark" ? "#1c0507" : "#e5ded4") : colors.text }]}>
                {t("সাইনআপ", "Sign Up")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {authTab === "signup" && (
              <TextInput
                placeholder={t("সম্পূর্ণ নাম", "Full Name")}
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              />
            )}

            <TextInput
              placeholder={t("ইমেইল অথবা মোবাইল নম্বর", "Email or Phone Number")}
              placeholderTextColor={colors.muted}
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              autoCapitalize="none"
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
            />

            {authTab === "signup" && !/^(?:\+8801|01)[3-9]\d{8}$/.test(emailOrPhone) && (
              <TextInput
                placeholder={t("মোবাইল নম্বর", "Mobile Number (e.g. 01700000000)")}
                placeholderTextColor={colors.muted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              />
            )}

            <TextInput
              placeholder={t("পাসওয়ার্ড (৬+ অক্ষর)", "Password (6+ chars)")}
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
            />

            {errorMsg !== "" && <Text style={styles.errorText}>{errorMsg}</Text>}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleAuth}
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            >
              {loading ? (
                <ActivityIndicator color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
              ) : (
                <Text style={[styles.submitBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
                  {authTab === "login" ? t("প্রবেশ করুন", "Login") : t("নিবন্ধন করুন", "Create Account")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ----- AUTHENTICATED VIEW -----
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Hero Banner */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(user?.name || "C").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || "Customer"}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || user?.phone}</Text>

          <View style={styles.profileMetaRow}>
            {/* Language toggle switcher button */}
            <TouchableOpacity
              onPress={toggleLang}
              style={[styles.metaActionBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            >
              <Globe size={14} color={colors.primary} />
              <Text style={[styles.metaActionText, { color: colors.text }]}>
                {lang === "bn" ? "English" : "বাংলা"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              style={[styles.metaActionBtn, { borderColor: "#d32f2f", backgroundColor: colors.background }]}
            >
              <LogOut size={14} color="#d32f2f" />
              <Text style={[styles.metaActionText, { color: "#d32f2f" }]}>{t("লগআউট", "Logout")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Tabs Selector */}
        <View style={[styles.dashboardTabs, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={() => setActiveTab("profile")}
            style={[styles.dashboardTabButton, activeTab === "profile" && { borderBottomColor: colors.primary }]}
          >
            <User size={18} color={activeTab === "profile" ? colors.primary : colors.muted} />
            <Text style={[styles.dashboardTabText, { color: activeTab === "profile" ? colors.text : colors.muted }]}>
              {t("প্রোফাইল", "Profile")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("wishlist")}
            style={[styles.dashboardTabButton, activeTab === "wishlist" && { borderBottomColor: colors.primary }]}
          >
            <Heart size={18} color={activeTab === "wishlist" ? colors.primary : colors.muted} />
            <Text style={[styles.dashboardTabText, { color: activeTab === "wishlist" ? colors.text : colors.muted }]}>
              {t("পছন্দ তালিকা", "Wishlist")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("addresses")}
            style={[styles.dashboardTabButton, activeTab === "addresses" && { borderBottomColor: colors.primary }]}
          >
            <MapPin size={18} color={activeTab === "addresses" ? colors.primary : colors.muted} />
            <Text style={[styles.dashboardTabText, { color: activeTab === "addresses" ? colors.text : colors.muted }]}>
              {t("ঠিকানা", "Addresses")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("orders")}
            style={[styles.dashboardTabButton, activeTab === "orders" && { borderBottomColor: colors.primary }]}
          >
            <Package size={18} color={activeTab === "orders" ? colors.primary : colors.muted} />
            <Text style={[styles.dashboardTabText, { color: activeTab === "orders" ? colors.text : colors.muted }]}>
              {t("অর্ডার", "Orders")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content Rendering */}
        
        {/* 1. PROFILE EDIT TAB */}
        {activeTab === "profile" && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
              {t("প্রোফাইল তথ্য সম্পাদন", "Edit Profile Details")}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t("সম্পূর্ণ নাম", "Full Name")}</Text>
              <TextInput
                value={profileName}
                onChangeText={setProfileName}
                style={[styles.dashboardInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t("ইমেইল ঠিকানা", "Email Address")}</Text>
              <TextInput
                value={profileEmail}
                onChangeText={setProfileEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.dashboardInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t("মোবাইল নম্বর", "Mobile Number")}</Text>
              <TextInput
                value={profilePhone}
                onChangeText={setProfilePhone}
                keyboardType="phone-pad"
                style={[styles.dashboardInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </View>

            {errorMsg !== "" && <Text style={[styles.errorText, { marginBottom: 10 }]}>{errorMsg}</Text>}
            {profileSuccessMsg !== "" && <Text style={styles.successText}>{profileSuccessMsg}</Text>}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleUpdateProfile}
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            >
              {updatingProfile ? (
                <ActivityIndicator color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />
              ) : (
                <Text style={[styles.submitBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
                  {t("পরিবর্তন সংরক্ষণ করুন", "Save Changes")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 2. MY WISHLIST TAB */}
        {activeTab === "wishlist" && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
              {t("আমার পছন্দের সুগন্ধি সমূহ", "My Wishlist")}
            </Text>

            {productsLoading ? (
              <ActivityIndicator size="small" color="#c9a84c" style={{ marginVertical: 20 }} />
            ) : wishlistProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Heart size={48} color={colors.muted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptySectionText, { color: colors.muted }]}>
                  {t("আপনার পছন্দের তালিকায় কোনো পণ্য নেই।", "Your wishlist is currently empty.")}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/shop")}
                  style={[styles.shopNowBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.shopNowBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
                    {t("পণ্য দেখুন", "Browse Perfumes")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              wishlistProducts.map((p) => {
                const currentPrice = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
                return (
                  <View key={p._id} style={[styles.wishlistCard, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <Image source={{ uri: p.images[0] }} style={styles.wishlistImage} />
                    <View style={styles.wishlistInfo}>
                      <Text style={[styles.wishlistName, { color: colors.text }]} numberOfLines={1}>
                        {lang === "bn" ? p.name.bn : p.name.en}
                      </Text>
                      <Text style={[styles.wishlistTagline, { color: colors.textSecondary }]} numberOfLines={1}>
                        {lang === "bn" ? p.tagline.bn : p.tagline.en}
                      </Text>
                      
                      <View style={styles.wishlistMeta}>
                        <Text style={[styles.wishlistPrice, { color: colors.primary }]}>৳{currentPrice}</Text>
                        {p.rating && (
                          <View style={styles.wishlistRating}>
                            <Star size={10} color="#c9a84c" fill="#c9a84c" />
                            <Text style={[styles.wishlistRatingText, { color: colors.text }]}>{p.rating.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.wishlistActions}>
                      <TouchableOpacity
                        onPress={() => router.push(`/products/${p.slug}`)}
                        style={[styles.wishlistIconBtn, { backgroundColor: colors.primary + "15" }]}
                      >
                        <ChevronRight size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => wishlist.toggle(p.slug)}
                        style={[styles.wishlistIconBtn, { backgroundColor: "rgba(211, 47, 47, 0.08)" }]}
                      >
                        <Trash2 size={16} color="#d32f2f" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* 3. ADDRESSES TAB */}
        {activeTab === "addresses" && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("আমার ঠিকানা বই", "Address Book")}
              </Text>
              <TouchableOpacity onPress={() => setShowAddressModal(true)} style={styles.addAddrBtn}>
                <Plus size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {(user?.addresses || []).length === 0 ? (
              <Text style={[styles.emptySectionText, { color: colors.muted, marginVertical: 12 }]}>
                {t("কোনো ঠিকানা যোগ করা হয়নি।", "No shipping address added yet.")}
              </Text>
            ) : (
              (user?.addresses || []).map((addr, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.addressCard,
                    { borderColor: addr.isDefault ? colors.primary : colors.border, backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.addrHeader}>
                    <Text style={[styles.addrLabel, { color: colors.primary }]}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>{t("ডিফল্ট", "Default")}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.addrInfo, { color: colors.text }]}>{addr.name} | {addr.phone}</Text>
                  <Text style={[styles.addrText, { color: colors.textSecondary }]}>
                    {addr.address}, {addr.area}, {addr.city}, {addr.district}
                  </Text>

                  <View style={styles.addrActions}>
                    {!addr.isDefault && (
                      <TouchableOpacity
                        onPress={() => setDefaultAddress(idx)}
                        style={[styles.addrActionBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                      >
                        <Check size={12} color={colors.textSecondary} />
                        <Text style={[styles.addrActionBtnText, { color: colors.textSecondary }]}>
                          {t("ডিফল্ট করুন", "Set Default")}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => removeAddress(idx)}
                      style={[styles.addrActionBtn, { backgroundColor: "rgba(211, 47, 47, 0.08)" }]}
                    >
                      <Trash2 size={12} color="#d32f2f" />
                      <Text style={[styles.addrActionBtnText, { color: "#d32f2f" }]}>{t("মুছুন", "Delete")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 4. ORDERS TAB */}
        {activeTab === "orders" && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
              {t("আমার অর্ডারসমূহ", "Order History")}
            </Text>

            {ordersLoading ? (
              <ActivityIndicator size="small" color="#c9a84c" style={{ marginVertical: 20 }} />
            ) : orders.length === 0 ? (
              <Text style={[styles.emptySectionText, { color: colors.muted }]}>
                {t("কোনো অর্ডার পাওয়া যায়নি।", "You haven't placed any orders yet.")}
              </Text>
            ) : (
              orders.map((ord) => {
                return (
                  <View key={ord._id} style={[styles.orderCard, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <View style={styles.orderHead}>
                      <Text style={[styles.orderNumber, { color: colors.text }]}>{ord.orderNumber}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: ord.status === "delivered" ? "#2e7d32" : "#f57c00" }]}>
                        <Text style={styles.statusText}>{ord.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={[styles.orderMeta, { color: colors.muted }]}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.orderItemsCount, { color: colors.text }]}>
                      {ord.items.length} {t("টি পণ্য", "fragrance(s)")}
                    </Text>
                    <Text style={[styles.orderTotal, { color: colors.primary }]}>
                      {t("মোট: ", "Total: ")}৳{ord.total}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}

      </ScrollView>

      {/* Address Form Modal */}
      <Modal visible={showAddressModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("নতুন ঠিকানা যোগ করুন", "Add Address")}</Text>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <TextInput
                placeholder={t("ঠিকানার ধরণ (Home, Office ইত্যাদি)", "Label (Home, Office, etc.)")}
                placeholderTextColor={colors.muted}
                value={addrLabel}
                onChangeText={setAddrLabel}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                placeholder={t("গ্রহীতার নাম", "Recipient Name")}
                placeholderTextColor={colors.muted}
                value={addrName}
                onChangeText={setAddrName}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                placeholder={t("মোবাইল নম্বর", "Mobile Number")}
                placeholderTextColor={colors.muted}
                value={addrPhone}
                onChangeText={setAddrPhone}
                keyboardType="phone-pad"
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                placeholder={t("রাস্তা / বাড়ি নং / গ্রাম", "Street / House / Village")}
                placeholderTextColor={colors.muted}
                value={addrStreet}
                onChangeText={setAddrStreet}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                placeholder={t("থানা / এলাকা", "Area / Police Station")}
                placeholderTextColor={colors.muted}
                value={addrArea}
                onChangeText={setAddrArea}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                placeholder={t("শহর", "City / Town")}
                placeholderTextColor={colors.muted}
                value={addrCity}
                onChangeText={setAddrCity}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                placeholder={t("জেলা", "District")}
                placeholderTextColor={colors.muted}
                value={addrDistrict}
                onChangeText={setAddrDistrict}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />

              <TouchableOpacity
                onPress={() => setAddrDefault(!addrDefault)}
                style={styles.defaultCheckboxRow}
              >
                <View style={[styles.checkbox, { borderColor: colors.border }, addrDefault && { backgroundColor: colors.primary }]}>
                  {addrDefault && <Check size={10} color={scheme === "dark" ? "#1c0507" : "#e5ded4"} />}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  {t("ডিফল্ট ঠিকানা হিসেবে সেট করুন", "Set as default address")}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalBtns}>
                <TouchableOpacity
                  onPress={() => setShowAddressModal(false)}
                  style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                >
                  <Text style={[styles.modalBtnText, { color: colors.text }]}>{t("বাতিল", "Cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddAddress}
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.modalBtnText, { color: scheme === "dark" ? "#1c0507" : "#e5ded4" }]}>
                    {t("সংরক্ষণ", "Save")}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  authScroll: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  authHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 2,
    fontFamily: "serif",
  },
  logoSub: {
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
  },
  tabsRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
    height: 48,
    width: "100%",
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  formContainer: {
    width: "100%",
    gap: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 14,
    marginBottom: 12,
  },
  submitBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  successText: {
    color: "#2e7d32",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "bold",
  },
  profileHeader: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  profileMetaRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  metaActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  metaActionText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  dashboardTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: 16,
    justifyContent: "space-between",
  },
  dashboardTabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flexDirection: "column",
    gap: 4,
  },
  dashboardTabText: {
    fontSize: 10.5,
    fontWeight: "bold",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  dashboardInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 13.5,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptySectionText: {
    fontSize: 12.5,
    textAlign: "center",
    marginBottom: 16,
  },
  shopNowBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shopNowBtnText: {
    fontSize: 12.5,
    fontWeight: "bold",
  },
  wishlistCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  wishlistImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  wishlistInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  wishlistName: {
    fontSize: 13.5,
    fontWeight: "bold",
  },
  wishlistTagline: {
    fontSize: 11,
    marginTop: 1.5,
  },
  wishlistMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 12,
  },
  wishlistPrice: {
    fontSize: 13,
    fontWeight: "bold",
  },
  wishlistRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  wishlistRatingText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  wishlistActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  wishlistIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addAddrBtn: {
    padding: 4,
  },
  addressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  addrHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  addrLabel: {
    fontSize: 13,
    fontWeight: "bold",
  },
  defaultBadge: {
    backgroundColor: "#c9a84c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1c0507",
  },
  addrInfo: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  addrText: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
  addrActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 8,
  },
  addrActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  addrActionBtnText: {
    fontSize: 10.5,
    fontWeight: "bold",
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  orderHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },
  orderMeta: {
    fontSize: 10.5,
    marginTop: 2,
  },
  orderItemsCount: {
    fontSize: 12,
    marginTop: 4,
  },
  orderTotal: {
    fontSize: 12.5,
    fontWeight: "bold",
    marginTop: 2,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "serif",
    textAlign: "center",
  },
  modalScroll: {
    paddingBottom: 20,
  },
  defaultCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingLeft: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 12.5,
  },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 13.5,
    fontWeight: "bold",
  },
});
