import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from './theme';
import { useApp } from './context/AppContext';
import { Card, StatBox } from './components/UI';

export default function ProgressScreen() {
  const { workouts, nutrition } = useApp();

  const totalVolume = workouts.reduce((sum, w) => sum + w.sets * w.reps * w.weight, 0);
  const avgWeight = workouts.length
    ? (workouts.reduce((s, w) => s + w.weight, 0) / workouts.length).toFixed(1)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Progress</Text>

        <Card>
          <Text style={styles.sectionTitle}>Workout Summary</Text>
          <View style={styles.statsRow}>
            <StatBox label="Total Sessions" value={workouts.length} unit="" color={colors.accent} />
            <StatBox label="Total Volume" value={`${(totalVolume / 1000).toFixed(1)}t`} unit="kg" color={colors.orange} />
            <StatBox label="Avg Weight" value={avgWeight} unit="kg" color={colors.green} />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Today's Nutrition</Text>
          <View style={styles.statsRow}>
            <StatBox label="Calories" value={Math.round(nutrition.calories)} unit="kcal" color={colors.orange} />
            <StatBox label="Protein" value={`${Math.round(nutrition.protein)}g`} unit="" color={colors.green} />
            <StatBox label="Carbs" value={`${Math.round(nutrition.carbs)}g`} unit="" color="#38bdf8" />
          </View>
        </Card>

        {workouts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No workouts logged yet.</Text>
            <Text style={styles.emptySubText}>Start logging to see your progress!</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Workout History</Text>
            {workouts.map((w, i) => (
              <Card key={i}>
                <View style={styles.historyRow}>
                  <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyName}>{w.name}</Text>
                    <Text style={styles.historyMeta}>{w.sets} sets · {w.reps} reps · {w.weight}kg</Text>
                  </View>
                  <Text style={styles.historyTime}>{w.time}</Text>
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
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.muted, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.sm },
  empty: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
  emptyText: { fontSize: 16, color: colors.muted, fontWeight: '600' },
  emptySubText: { fontSize: 13, color: colors.border },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  historyName: { fontSize: 14, fontWeight: '600', color: colors.text },
  historyMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  historyTime: { fontSize: 11, color: colors.muted },
});
