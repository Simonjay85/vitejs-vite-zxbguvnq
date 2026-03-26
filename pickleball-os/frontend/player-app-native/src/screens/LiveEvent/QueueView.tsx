import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, SPACING } from '../../theme';
import { useEventStore } from '../../store/useEventStore';

function WaveRing({ delay = 0 }: { delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const opacity = anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.6, 0.4, 0] });
  return (
    <Animated.View style={[styles.ring, { transform: [{ scale }], opacity }]} />
  );
}

export default function QueueView() {
  const { player, players, courts, queue, queuePosition, estimatedWait, activeEvent } = useEventStore();

  const friendsInQueue = queue
    .flatMap((q: any) => [...(q.team1 || []), ...(q.team2 || [])].filter(Boolean))
    .filter((p: any) => p.id !== player?.id)
    .slice(0, 5);

  const liveCourts = courts.filter((c) => c.match);
  const freeCount = courts.length - liveCourts.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Active event banner */}
      {activeEvent && (
        <LinearGradient colors={[COLORS.accent + '18', COLORS.panel]} style={styles.eventBanner}>
          <View style={styles.liveDot} />
          <Text style={styles.eventName}>{activeEvent.name}</Text>
        </LinearGradient>
      )}

      {/* Queue status hero */}
      <View style={styles.hero}>
        <View style={styles.pulseContainer}>
          <WaveRing delay={0} />
          <WaveRing delay={600} />
          <WaveRing delay={1200} />
          <LinearGradient
            colors={GRADIENTS.hero}
            style={styles.heroBadge}
          >
            <Text style={styles.heroEmoji}>⏳</Text>
          </LinearGradient>
        </View>

        <Text style={styles.statusLabel}>ĐANG XẾP HÀNG CHỜ</Text>
        <Text style={styles.playerName}>{player?.name || 'Người chơi'}</Text>
        <Text style={styles.eloText}>ELO: {player?.elo || 1300}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'VỊ TRÍ', value: queuePosition > 0 ? `#${queuePosition}` : '—', color: COLORS.accent },
          { label: 'ƯỚC TÍNH', value: estimatedWait > 0 ? `~${estimatedWait}m` : '—', color: COLORS.gold },
          { label: 'SÂN TRỐNG', value: String(freeCount), color: COLORS.accentGreen },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* AI message */}
      <LinearGradient
        colors={[COLORS.purple + '22', COLORS.card]}
        style={styles.aiCard}
      >
        <Text style={styles.aiIcon}>🧠</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiTitle}>AI Matchmaker đang xử lý</Text>
          <Text style={styles.aiSub}>
            {queuePosition > 0
              ? `Bạn đang ở vị trí #${queuePosition}. Dự kiến khoảng ${estimatedWait} phút nữa!`
              : 'Đang tìm đối thủ phù hợp về trình độ với bạn…'}
          </Text>
        </View>
      </LinearGradient>

      {/* Court status */}
      {liveCourts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏟️ SÂN ĐANG ĐẤU ({liveCourts.length}/{courts.length})</Text>
          {liveCourts.map((c: any) => (
            <View key={c.id} style={styles.courtRow}>
              <View style={styles.courtDot} />
              <Text style={styles.courtName}>{c.name}</Text>
              <Text style={styles.courtMatch}>
                {(c.match?.team1 || []).map((p: any) => p.name?.split(' ').pop()).join(' & ')}
                {'  vs  '}
                {(c.match?.team2 || []).map((p: any) => p.name?.split(' ').pop()).join(' & ')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Friends in queue */}
      {friendsInQueue.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 NGƯỜI KHÁC ĐANG CHỜ</Text>
          {friendsInQueue.map((p: any) => (
            <View key={p.id} style={styles.friendRow}>
              <View style={[styles.avatar, { backgroundColor: COLORS.purple + '44' }]}>
                <Text style={styles.avatarText}>{p.name?.[0] || '?'}</Text>
              </View>
              <Text style={styles.friendName}>{p.name}</Text>
              <Text style={styles.friendElo}>{p.elo || 1300} ELO</Text>
            </View>
          ))}
        </View>
      )}

      {/* Leave queue */}
      <TouchableOpacity style={styles.leaveBtn} activeOpacity={0.8}>
        <Text style={styles.leaveBtnText}>← Rời khỏi hàng chờ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 40 },

  eventBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: SPACING.md, paddingVertical: 8,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.red },
  eventName: { color: COLORS.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  hero: { alignItems: 'center', paddingVertical: SPACING.xl },
  pulseContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  ring: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 1.5, borderColor: COLORS.accent,
  },
  heroBadge: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.accent, shadowRadius: 20, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  heroEmoji: { fontSize: 34 },
  statusLabel: {
    fontSize: 12, fontWeight: '800', color: COLORS.accent,
    letterSpacing: 2, marginBottom: 6,
  },
  playerName: { fontSize: 22, fontWeight: '900', color: COLORS.white, marginBottom: 4 },
  eloText: { fontSize: 12, color: COLORS.muted },

  statsRow: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.card,
    borderRadius: RADIUS.md, padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 9, color: COLORS.muted, fontWeight: '700', letterSpacing: 1 },

  aiCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    padding: SPACING.md, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.purple + '44',
  },
  aiIcon: { fontSize: 28 },
  aiTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  aiSub: { fontSize: 11, color: COLORS.muted, lineHeight: 16 },

  section: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    backgroundColor: COLORS.panel, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 10, fontWeight: '800', color: COLORS.muted,
    letterSpacing: 1.5, marginBottom: SPACING.sm,
  },

  courtRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  courtDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.red },
  courtName: { fontSize: 12, fontWeight: '700', color: COLORS.text, width: 56 },
  courtMatch: { fontSize: 11, color: COLORS.muted, flex: 1 },

  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8,
  },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '900', color: COLORS.white },
  friendName: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },
  friendElo: { fontSize: 11, color: COLORS.accent, fontWeight: '700' },

  leaveBtn: {
    marginHorizontal: SPACING.md,
    paddingVertical: 14, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.red + '44',
    alignItems: 'center',
  },
  leaveBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
});
