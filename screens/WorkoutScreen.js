import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from './theme';
import { useApp } from './context/AppContext';
import { Card } from './components/UI';

const EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Pull-Up', 'Shoulder Press',
  'Bicep Curl', 'Tricep Dip', 'Leg Press', 'Lat Pulldown', 'Row',
];

export default function WorkoutScreen({ navigation }) {
  const { logWorkout } = useApp();
  const [selected, setSelected] = useState('Bench Press');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('60');
  const [logged, setLogged] = useState([]);

  const handleLog = () => {
    const entry = {
      name: selected,
      sets: parseInt(sets) || 0,
      reps: parseInt(reps) || 0,
      weight: parseFloat(weight) || 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    logWorkout(entry);
    setLogged(prev => [entry, ...prev]);
    Alert.alert('✅ Logged!', `${selected} added to today's workout.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Log Workout</Text>

        {/* Exercise Picker */}
        <Text style={styles.label}>Exercise</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
          {EXERCISES.map(ex => (
            <TouchableOpacity
              key={ex}
              style={[styles.pill, selected === ex && styles.pillActive]}
              onPress={() => setSelected(ex)}
            >
              <Text style={[styles.pillText, selected === ex && styles.pillTextActive]}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Inputs */}
        <Card>
          <Text style={styles.exerciseName}>{selected}</Text>
          <View style={styles.inputRow}>
            {[['Sets', sets, setSets], ['Reps', reps, setReps], ['Weight (kg)', weight, setWeight]].map(([lbl, val, setter]) => (
              <View key={lbl} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{lbl}</Text>
                <TextInput
                  style={styles.input}
                  value={val}
                  onChangeText={setter}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.logBtn} onPress={handleLog} activeOpacity={0.85}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.logBtnText}>Log Set</Text>
          </TouchableOpacity>
        </Card>

        {/* Session Log */}
        {logged.length > 0 && (
          <>
            <Text style={styles.label}>Today's Session</Text>
            {logged.map((w, i) => (
              <Card key={i}>
                <View style={styles.logRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.green} />
                  <Text style={styles.logName}>{w.name}</Text>
                  <Text style={styles.logMeta}>{w.sets}×{w.reps} @ {w.weight}kg</Text>
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
  label: { fontSize: 13, color: colors.muted, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  pills: { marginBottom: spacing.md },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  pillActive: { backgroundColor: '#2e1065', borderColor: colors.accent },
  pillText: { color: colors.muted, fontSize: 13 },
  pillTextActive: { color: colors.accentLight, fontWeight: '600' },
  exerciseName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 11, color: colors.muted, marginBottom: 4 },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logName: { flex: 1, color: colors.text, fontWeight: '600', fontSize: 14 },
  logMeta: { color: colors.muted, fontSize: 13 },
});
