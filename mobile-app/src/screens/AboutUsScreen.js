import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { COLORS } from '../constants/colors';

export default function AboutUsScreen({ navigation }) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.brand}>SellMix</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>About Us</Text>

        <Text style={s.body}>
          Welcome to <Text style={s.bold}>SellMix</Text>,
        </Text>
        <Text style={s.body}>
          Your number one source for quality grocery products in Chichawatni. We are dedicated to
          bringing you the very best products whilst focusing on three core principles:{' '}
          <Text style={s.bold}>dependability, customer service, and freshness</Text>. SellMix was
          founded with a simple goal — to offer quality groceries at honest prices while making it
          easy and convenient for every household in Chichawatni.
        </Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>Mission Statement</Text>
          <Text style={s.cardBody}>
            SellMix is on a mission to deliver quality beyond question and save you money —
            adding something special to your everyday shopping experience.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Vision Statement</Text>
          <Text style={s.cardBody}>
            For every household in Chichawatni to experience the convenience of fresh, quality
            groceries delivered right to their door at the best possible prices.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Core Values</Text>
          <Text style={s.cardBody}>
            To listen to our customers and care for their needs. To provide fresh, quality products
            with honesty and transparency. To build lasting relationships through commitment,
            respect, and trust.
          </Text>
        </View>

        <View style={s.contactCard}>
          <Text style={s.contactTitle}>Contact Us</Text>
          <Text style={s.contactLine}>📞  03178384342</Text>
          <Text style={s.contactLine}>📍  Block #16, Govt Crescent Girls College Road, Chichawatni</Text>
          <TouchableOpacity
            style={s.waBtn}
            onPress={() => Linking.openURL('whatsapp://send?phone=923178384342&text=Hi SellMix!')}
          >
            <Text style={s.waBtnTxt}>💬  Chat on WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, paddingHorizontal: 16,
    paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  brand: { fontSize: 22, fontWeight: '800', color: COLORS.primary },

  content: { padding: 20 },

  pageTitle: { fontSize: 26, fontWeight: '900', color: COLORS.black, marginBottom: 16 },
  body: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 12 },
  bold: { fontWeight: '700', color: COLORS.black },

  card: {
    backgroundColor: '#f8f8ff', borderRadius: 14, padding: 18,
    marginBottom: 14, borderLeftWidth: 4, borderLeftColor: COLORS.primary,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black, marginBottom: 8, textAlign: 'center' },
  cardBody: { fontSize: 13, color: '#555', lineHeight: 20, textAlign: 'center' },

  contactCard: {
    backgroundColor: COLORS.secondary, borderRadius: 14, padding: 20,
    marginTop: 8, alignItems: 'flex-start',
  },
  contactTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black, marginBottom: 12 },
  contactLine: { fontSize: 14, color: '#444', marginBottom: 8, fontWeight: '500' },
  waBtn: {
    marginTop: 8, backgroundColor: '#25D366',
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10,
  },
  waBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
