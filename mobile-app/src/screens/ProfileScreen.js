import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const MENU_ITEMS = [
  { icon: '📦', label: 'My Orders', screen: 'Orders' },
  { icon: '📍', label: 'Delivery Addresses', screen: null },
  { icon: '💳', label: 'Payment Methods', screen: null },
  { icon: '🔔', label: 'Notifications', screen: null },
  { icon: '📞', label: 'Contact Support', action: 'whatsapp' },
  { icon: '⚙️', label: 'App Settings', screen: null },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleMenuPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.action === 'whatsapp') {
      Linking.openURL('whatsapp://send?phone=923001234567&text=Hi, I need help!');
    }
  };

  if (!user) {
    return (
      <View style={s.guestWrap}>
        <View style={s.guestAvatarBox}>
          <Text style={s.guestAvatarTxt}>👤</Text>
        </View>
        <Text style={s.guestTitle}>You're not logged in</Text>
        <Text style={s.guestSub}>Login to manage your orders, addresses and more.</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={s.loginBtnTxt}>Login to Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={s.signupLink}>Don't have an account? <Text style={s.signupLinkBold}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      {/* Avatar Card */}
      <View style={s.avatarCard}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{initials}</Text>
        </View>
        <Text style={s.userName}>{user.name}</Text>
        <Text style={s.userMobile}>{user.mobile}</Text>
        {user.address ? (
          <View style={s.addressRow}>
            <Text style={s.addressTxt}>📍 {user.address}</Text>
          </View>
        ) : null}
        {user.role === 'admin' && (
          <View style={s.adminBadge}>
            <Text style={s.adminBadgeTxt}>⚡ ADMIN</Text>
          </View>
        )}
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statNum}>0</Text>
          <Text style={s.statLabel}>Orders</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>0</Text>
          <Text style={s.statLabel}>Wishlist</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>Chichawatni</Text>
          <Text style={s.statLabel}>City</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={s.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[s.menuItem, i === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }]}
            onPress={() => handleMenuPress(item)}
          >
            <View style={s.menuIconBox}>
              <Text style={s.menuIcon}>{item.icon}</Text>
            </View>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={s.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* App info */}
      <View style={s.appInfo}>
        <Text style={s.appInfoTxt}>SellMix  •  Chichawatni, Pakistan</Text>
        <Text style={s.appVersion}>Version 1.0.0</Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutTxt}>🚪  Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Guest
  guestWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background, padding: 32,
  },
  guestAvatarBox: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.lightGrey,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  guestAvatarTxt: { fontSize: 36 },
  guestTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  guestSub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  loginBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, marginBottom: 16 },
  loginBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  signupLink: { fontSize: 14, color: COLORS.textLight },
  signupLinkBold: { color: COLORS.primary, fontWeight: '700' },

  // Header
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: 18,
    paddingTop: 50, paddingBottom: 16,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },

  // Avatar card
  avatarCard: {
    backgroundColor: COLORS.white, marginHorizontal: 14, marginTop: 14,
    borderRadius: 18, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarTxt: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  userMobile: { fontSize: 14, color: COLORS.textLight, marginBottom: 6 },
  addressRow: { backgroundColor: COLORS.secondary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginTop: 4 },
  addressTxt: { fontSize: 12, color: COLORS.textLight },
  adminBadge: {
    marginTop: 12, backgroundColor: COLORS.primary,
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  adminBadgeTxt: { color: COLORS.white, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  // Stats
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    marginHorizontal: 14, marginTop: 10, borderRadius: 14,
    padding: 16, alignItems: 'center', justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 3 },
  statLabel: { fontSize: 12, color: COLORS.textLight },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },

  // Menu
  menuCard: {
    backgroundColor: COLORS.white, marginHorizontal: 14, marginTop: 10,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15,
    borderBottomWidth: 1, borderColor: COLORS.lightGrey,
  },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.secondary,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  menuArrow: { fontSize: 22, color: COLORS.textMuted },

  // App info
  appInfo: { alignItems: 'center', marginTop: 20, marginBottom: 4 },
  appInfoTxt: { fontSize: 13, color: COLORS.textMuted },
  appVersion: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },

  // Logout
  logoutBtn: {
    marginHorizontal: 14, marginTop: 10, backgroundColor: COLORS.white,
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFCDD2',
  },
  logoutTxt: { color: COLORS.error, fontWeight: '700', fontSize: 16 },
});
