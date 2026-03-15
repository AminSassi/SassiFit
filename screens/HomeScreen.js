import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from './theme';
import { useApp } from './context/AppContext';
import { Card, StatBox } from './components/UI';

const QUICK_ACTIONS = [
  { icon: 'barbell', label: 'Log Workout', screen: 'Workout', color: colors.accent },
  { icon: 'nutrition', label: 'Log Meal', screen: 'Nutrition', color: colors.green },
  { icon: 'analytics', label: 'Progress', screen: 'Progress', color: colors.orange },
  { icon: 'person', label: 'Profile', screen: 'Profile', color: '#38bdf8' },
];

export default function HomeScreen({ navigation }) {
  const { user, workouts, nutrition } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#1a0533', colors.bg]} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.name}>{user.name} 👋</Text>
            <Text style={styles.goal}>{user.goal}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color={colors.orange} />
            <Text style={styles.streakText}>{user.streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </LinearGradient>

        {/* Today's Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Today's Stats</Text>
          <View style={styles.statsRow}>
            <StatBox label="Calories" value={nutrition.calories} unit="kcal" color={colors.orange} />
            <StatBox label="Protein" value={`${nutrition.protein}g`} unit="" color={colors.green} />
            <StatBox label="Workouts" value={workouts.length} unit="done" color={colors.accent} />
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(({ icon, label, screen, color }) => (
            <TouchableOpacity
              key={screen}
              style={styles.actionCard}
              onPress={() => navigation.navigate(screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: color + '22' }]}>
                <Ionicons name={icon} size={26} color={color} />
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Workouts */}
        {workouts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {workouts.slice(0, 3).map((w, i) => (
              <Card key={i}>
                <View style={styles.workoutRow}>
                  <Ionicons name="barbell" size={18} color={colors.accent} />
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.workoutName}>{w.name}</Text>
                    <Text style={styles.workoutMeta}>{w.sets} sets · {w.reps} reps · {w.weight}kg</Text>
                  </View>
                  <Text style={styles.workoutTime}>{w.time}</Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  greeting: { fontSize: 13, color: colors.muted },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  goal: { fontSize: 13, color: colors.accentLight, marginTop: 2 },
  streakBadge: { alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  streakText: { fontSize: 22, fontWeight: '800', color: colors.orange },
  streakLabel: { fontSize: 10, color: colors.muted },
  statsCard: { marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  actionLabel: { fontSize: 13, color: colors.text, fontWeight: '600' },
  workoutRow: { flexDirection: 'row', alignItems: 'center' },
  workoutName: { fontSize: 14, fontWeight: '600', color: colors.text },
  workoutMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  workoutTime: { fontSize: 11, color: colors.muted },
});
