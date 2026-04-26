import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Alert, View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { COLORS } from '../constants/colors';

const SLOT_TOAST_KEY = 'slx_slot_toast_shown';

function DeliverySlotToast() {
  const [visible, setVisible] = useState(false);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Show on every app open (once per session — cleared when app is killed)
    setVisible(true);
    progress.setValue(1);
    Animated.timing(progress, { toValue: 0, duration: 20000, useNativeDriver: false }).start();
    const t = setTimeout(() => setVisible(false), 20000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <View style={ts.overlay} pointerEvents="box-none">
      <View style={ts.toast}>
        <Text style={ts.emoji}>🚚</Text>
        <Text style={ts.title}>We deliver twice a day in Chichawatni!</Text>
        <View style={ts.slots}>
          <View style={ts.slotCard}>
            <Text style={ts.slotIcon}>🌅</Text>
            <View style={ts.slotText}>
              <Text style={ts.slotName}>Morning Slot</Text>
              <Text style={ts.slotTime}>10:00 AM – 1:00 PM</Text>
            </View>
          </View>
          <View style={ts.slotCard}>
            <Text style={ts.slotIcon}>🌆</Text>
            <View style={ts.slotText}>
              <Text style={ts.slotName}>Afternoon Slot</Text>
              <Text style={ts.slotTime}>4:00 PM – 7:00 PM</Text>
            </View>
          </View>
        </View>
        <Text style={ts.note}>Please select your slot carefully at checkout ✅</Text>
        <TouchableOpacity style={ts.closeBtn} onPress={() => setVisible(false)}>
          <Text style={ts.closeTxt}>✕</Text>
        </TouchableOpacity>
        <View style={ts.progressBar}>
          <Animated.View style={[ts.progressFill, { flex: progress }]} />
        </View>
      </View>
    </View>
  );
}

const ts = StyleSheet.create({
  overlay: { position: 'absolute', bottom: 80, left: 10, right: 10, zIndex: 9999 },
  toast: { backgroundColor: '#fff', borderRadius: 20, padding: 22, paddingBottom: 12, overflow: 'hidden', borderTopWidth: 5, borderTopColor: '#7c3aed', shadowColor: '#7c3aed', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  emoji: { fontSize: 32, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '900', color: '#1a1a1a', marginBottom: 16 },
  slots: { flexDirection: 'column', gap: 10, marginBottom: 14 },
  slotCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#f9f5ff', borderRadius: 12, padding: 12, borderLeftWidth: 4, borderLeftColor: '#7c3aed' },
  slotText: { flex: 1 },
  slotIcon: { fontSize: 28 },
  slotName: { fontSize: 13, fontWeight: '800', color: '#7c3aed', marginBottom: 3 },
  slotTime: { fontSize: 16, fontWeight: '900', color: '#1a1a1a' },
  note: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  closeBtn: { position: 'absolute', top: 12, right: 14, padding: 4 },
  closeTxt: { color: '#9ca3af', fontSize: 18 },
  progressBar: { flexDirection: 'row', height: 5, backgroundColor: '#f3e8ff', borderRadius: 3 },
  progressFill: { backgroundColor: '#7c3aed', borderRadius: 3 },
});

const CANCEL_SEEN_KEY = 'slx_cancelled_order_ids';

async function playCancelSound() {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3' }
    );
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.didJustFinish) sound.unloadAsync();
    });
  } catch (_) {}
}

function CancelWatcher() {
  const { user } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const check = async () => {
      try {
        const res = await ordersAPI.getMyOrders();
        const orders = res.data || [];
        const seenRaw = await AsyncStorage.getItem(CANCEL_SEEN_KEY);
        const seen = new Set(JSON.parse(seenRaw || '[]'));
        const newlyCancelled = orders.filter(
          (o) => o.status === 'cancelled' && !seen.has(o._id)
        );
        if (newlyCancelled.length > 0) {
          newlyCancelled.forEach((o) => seen.add(o._id));
          await AsyncStorage.setItem(CANCEL_SEEN_KEY, JSON.stringify([...seen]));
          await playCancelSound();
          const ids = newlyCancelled.map((o) => `#${o.orderId}`).join(', ');
          Alert.alert('Order Cancelled ❌', `Your order ${ids} has been cancelled. Please contact support if you have questions.`);
        }
      } catch (_) {}
    };

    check();
    timerRef.current = setInterval(check, 30000);
    return () => clearInterval(timerRef.current);
  }, [user]);

  return null;
}

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import AllCategoriesScreen from '../screens/AllCategoriesScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OffersScreen from '../screens/OffersScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import ContactUsScreen from '../screens/ContactUsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const icons = {
    Home: '🏠',
    Categories: '⊞',
    Search: '🔍',
    Offers: '🏷️',
    Profile: '👤',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name]}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: '#eee',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 4,
          height: 62,
        },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={AllCategoriesScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Offers" component={OffersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <CancelWatcher />
      <DeliverySlotToast />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="SubCategories" component={CategoriesScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="AboutUs" component={AboutUsScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
