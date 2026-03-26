import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, RADIUS, SPACING } from '../../theme';
import { useEventStore } from '../../store/useEventStore';

export default function MatchAssignedView() {
  const { myMatch, player, setPhase } = useEventStore();

  // Flash animation on mount
  const flashAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0.6, duration: 200, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }).start();
  }, []);

  if (!myMatch) return null;

  const isInTeam1 = myMatch.team1.some(p => p.id === player?.id);
  const myTeam = isInTeam1 ? myMatch.team1 : myMatch.team2;
  const oppTeam = isInTeam1 ? myMatch.team2 : myMatch.team1;
  const myFairness = isInTeam1 ? myMatch.fairness : 100 - myMatch.fairness;
  const oppFairness = 100 - myFairness;

  return (
    <View style={styles.container}>
      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flashOverlay, { opacity: flashAnim }]}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Court badge */}
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <LinearGradient
            colors={GRADIENTS.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.courtBadge}
          >
            <Text style={styles.proceedLabel}>TIẾN ĐẾN</Text>
            <Text style={styles.courtName}>{myMatch.courtName.toUpperCase()}</Text>
            <Text style={styles.courtId}>{myMatch.courtId.toUpperCase()}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Fairness meter */}
        <View style={styles.fairnessCard}>
          <Text style={styles.fairnessTitle}>⚖️ Độ cân bằng trận đấu</Text>
          <View style={styles.fairnessBar}>
            <LinearGradient
              colors={[COLORS.accentGreen, COLORS.accent]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.fairnessFill, { flex: myFairness }]}
            />
            <View style={[styles.fairnessFill, { flex: oppFairness, backgroundColor: COLORS.gold }]} />
          </View>
          <View style={styles.fairnessLabels}>
            <Text style={[styles.fairnessLabel, { color: COLORS.accent }]}>Đội bạn {myFairness}%</Text>
            <Text style={[styles.fairnessLabel, { color: COLORS.gold }]}>{oppFairness}% Đối thủ</Text>
          </View>
        </View>

        {/* Teams */}
        <View style={styles.teamsRow}>
          {/* My team */}
          <View style={[styles.teamCard, { borderColor: COLORS.accent + '66' }]}>
            <LinearGradient colors={[COLORS.accent + '18', COLORS.card]} style={styles.teamInner}>
              <Text style={[styles.teamLabel, { color: COLORS.accent }]}>ĐỘI BẠN</Text>
              {myTeam.map((p) => (
                <View key={p.id} style={styles.memberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: COLORS.accent + '44' }]}>
                    <Text style={styles.avatarText}>{p.name?.[0] || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.memberElo}>{p.elo} ELO</Text>
                  </View>
                  {p.id === player?.id && (
                    <Text style={styles.youBadge}>BẠN</Text>
                  )}
                </View>
              ))}
            </LinearGradient>
          </View>

          <Text style={styles.vsText}>VS</Text>

          {/* Opp team */}
          <View style={[styles.teamCard, { borderColor: COLORS.gold + '66' }]}>
            <LinearGradient colors={[COLORS.gold + '18', COLORS.card]} style={styles.teamInner}>
              <Text style={[styles.teamLabel, { color: COLORS.gold }]}>ĐỐI THỦ</Text>
              {oppTeam.map((p) => (
                <View key={p.id} style={styles.memberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: COLORS.gold + '44' }]}>
                    <Text style={styles.avatarText}>{p.name?.[0] || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.memberElo}>{p.elo} ELO</Text>
                  </View>
                </View>
              ))}
            </LinearGradient>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={() => setPhase('playing')} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTS.hero}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>🏓  BẮT ĐẦU TRẬN ĐẤU</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.notReadyBtn} activeOpacity={0.8}>
          <Text style={styles.notReadyText}>⚠️ Tôi chưa sẵn sàng</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.accent,
    zIndex: 99,
  },
  content: { padding: SPACING.md, paddingBottom: 40 },

  courtBadge: {
    alignItems: 'center', justifyContent: 'center',
    borderRadius: RADIUS.xl, padding: SPACING.xl,
    marginBottom: SPACING.md,
    shadowColor: COLORS.accent, shadowRadius: 30, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  proceedLabel: {
    fontSize: 11, fontWeight: '800', color: '#00000088', letterSpacing: 3, marginBottom: 4,
  },
  courtName: { fontSize: 52, fontWeight: '900', color: '#000', letterSpacing: 2, lineHeight: 56 },
  courtId: { fontSize: 14, fontWeight: '700', color: '#00000066', letterSpacing: 2, marginTop: 4 },

  fairnessCard: {
    backgroundColor: COLORS.panel, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  fairnessTitle: { fontSize: 12, fontWeight: '700', color: COLORS.muted, marginBottom: 10 },
  fairnessBar: {
    flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  fairnessFill: { height: 8 },
  fairnessLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  fairnessLabel: { fontSize: 12, fontWeight: '800' },

  teamsRow: {
    flexDirection: 'row', gap: SPACING.sm,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  vsText: {
    fontSize: 16, fontWeight: '900', color: COLORS.muted, marginHorizontal: 4,
  },
  teamCard: {
    flex: 1, borderRadius: RADIUS.md, borderWidth: 1.5, overflow: 'hidden',
  },
  teamInner: { padding: SPACING.sm },
  teamLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  memberAvatar: {
    width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '900', color: COLORS.white },
  memberName: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  memberElo: { fontSize: 10, color: COLORS.muted },
  youBadge: {
    fontSize: 8, fontWeight: '900', color: COLORS.accentGreen,
    backgroundColor: COLORS.accentGreen + '22',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    letterSpacing: 1,
  },

  ctaBtn: {
    paddingVertical: 18, borderRadius: RADIUS.md,
    alignItems: 'center', marginBottom: SPACING.sm,
    shadowColor: COLORS.accent, shadowRadius: 16, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  ctaText: { fontSize: 17, fontWeight: '900', color: '#000', letterSpacing: 1.5 },

  notReadyBtn: {
    paddingVertical: 14, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.gold + '44',
    alignItems: 'center',
  },
  notReadyText: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
});
