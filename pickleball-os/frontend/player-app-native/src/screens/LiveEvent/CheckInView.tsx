import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, RADIUS, SPACING } from '../../theme';
import { useEventStore } from '../../store/useEventStore';

export default function CheckInView() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const checkIn = useEventStore(s => s.checkIn);
  const players = useEventStore(s => s.players);
  const activeEvent = useEventStore(s => s.activeEvent);

  const handleCheckIn = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Mã phải là 6 chữ số');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    setError('');
    const ok = await checkIn(code);
    if (!ok) {
      setError('Mã không hợp lệ. Vui lòng kiểm tra lại!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setLoading(false);
  };

  const checkedInCount = players.filter(p => p.checkedIn).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Hero */}
      <LinearGradient colors={['#0a1628', '#111e30']} style={styles.hero}>
        <View style={styles.logoRing}>
          <Text style={styles.logoIcon}>🏓</Text>
        </View>
        <Text style={styles.brand}>PICKLEBALL HUB</Text>
        <Text style={styles.tagline}>
          {activeEvent ? activeEvent.name : 'Daily Session'}
        </Text>

        {/* Live stats pill */}
        <View style={styles.statPill}>
          <View style={styles.dot} />
          <Text style={styles.statText}>LIVE · {checkedInCount} người đang chơi</Text>
        </View>
      </LinearGradient>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ĐĂNG NHẬP VÀO EVENT</Text>
        <Text style={styles.cardSub}>Nhập mã 6 số sau khi check-in tại quầy</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          value={code}
          onChangeText={t => { setCode(t.replace(/[^0-9]/g, '')); setError(''); }}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="● ● ● ● ● ●"
          placeholderTextColor={COLORS.muted}
          onSubmitEditing={handleCheckIn}
          returnKeyType="go"
          textAlign="center"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity onPress={handleCheckIn} disabled={loading} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTS.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.btn, loading && { opacity: 0.6 }]}
          >
            <Text style={styles.btnText}>
              {loading ? '⏳ Đang xác thực...' : 'VÀO EVENT 🔑'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
          <Text style={styles.secondaryText}>📷  Quét QR code tại quầy</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Mã cá nhân được phát sau khi check-in · Mã khán giả do Host cấp
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoRing: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.card,
    borderWidth: 2, borderColor: COLORS.accent + '66',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.accent, shadowRadius: 20, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  logoIcon: { fontSize: 34 },
  brand: {
    fontSize: 26, fontWeight: '900', color: COLORS.white,
    letterSpacing: 3, marginBottom: 6,
  },
  tagline: { fontSize: 13, color: COLORS.muted, letterSpacing: 1.5 },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 16, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent + '18',
    borderWidth: 1, borderColor: COLORS.accent + '44',
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: COLORS.accentGreen,
  },
  statText: { fontSize: 11, color: COLORS.accent, fontWeight: '700', letterSpacing: 1 },

  card: {
    flex: 1,
    backgroundColor: COLORS.panel,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  cardTitle: {
    fontSize: 18, fontWeight: '900', color: COLORS.white,
    letterSpacing: 2, marginBottom: 6,
  },
  cardSub: { fontSize: 13, color: COLORS.muted, marginBottom: SPACING.lg },

  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: 28, fontWeight: '800',
    letterSpacing: 12,
    marginBottom: SPACING.md,
  },
  inputError: { borderColor: COLORS.red },
  error: { color: COLORS.red, fontSize: 12, marginBottom: SPACING.sm, textAlign: 'center' },

  btn: {
    paddingVertical: 16, borderRadius: RADIUS.md,
    alignItems: 'center', marginBottom: SPACING.md,
    shadowColor: COLORS.accent, shadowRadius: 16, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  btnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1.5 },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.muted, fontSize: 11, marginHorizontal: SPACING.sm },

  secondaryBtn: {
    paddingVertical: 14, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
  },
  secondaryText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 11, color: COLORS.dim, textAlign: 'center', lineHeight: 18 },
});
