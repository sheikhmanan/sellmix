import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const MAX = 5;

/**
 * Inline Add / +− quantity control.
 *
 * Props:
 *   qty         – current quantity in cart (0 = not added)
 *   onAdd       – called when "Add" is pressed (qty === 0)
 *   onIncrease  – called when + is pressed
 *   onDecrease  – called when − is pressed (qty 1 → removes item)
 *   compact     – smaller variant for grid cards (default false)
 */
export default function QtyControl({ qty, onAdd, onIncrease, onDecrease, compact = false }) {
  if (qty <= 0) {
    return (
      <TouchableOpacity style={[s.addBtn, compact && s.addBtnCompact]} onPress={onAdd} activeOpacity={0.8}>
        <Text style={[s.addTxt, compact && s.addTxtCompact]}>{compact ? '+' : 'Add'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[s.row, compact && s.rowCompact]}>
      <TouchableOpacity style={[s.btn, compact && s.btnCompact]} onPress={onDecrease} activeOpacity={0.75}>
        <Text style={[s.btnTxt, compact && s.btnTxtCompact]}>−</Text>
      </TouchableOpacity>
      <Text style={[s.qty, compact && s.qtyCompact]}>{qty}</Text>
      <TouchableOpacity
        style={[s.btn, compact && s.btnCompact, qty >= MAX && s.btnDisabled]}
        onPress={qty < MAX ? onIncrease : undefined}
        activeOpacity={qty < MAX ? 0.75 : 1}
      >
        <Text style={[s.btnTxt, compact && s.btnTxtCompact, qty >= MAX && s.btnTxtDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  // ── Full size (list cards) ───────────────────────────────────────────────
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565c0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  qty: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    minWidth: 26,
    textAlign: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnTxtDisabled: {},

  // ── Compact (grid cards) ─────────────────────────────────────────────────
  addBtnCompact: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxtCompact: { fontSize: 20, lineHeight: 22 },

  rowCompact: {
    borderRadius: 14,
    backgroundColor: '#1565c0',
  },
  btnCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  btnTxtCompact: { fontSize: 16, lineHeight: 18 },
  qtyCompact: { fontSize: 13, minWidth: 18 },
});
