import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from './theme';
import { useApp } from './context/AppContext';

const GOALS = ['Build Muscle', 'Lose Fat', 'Improve Endurance', 'Stay Active'];

export default function LoginScreen({ navigation }) {
  const { setUser } = useApp();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(GOALS[0]);

  const handleStart = () => {
    if (!name.trim()) return;
    setUser({ name: name.trim(), goal, streak: 0 });
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <LinearGradient colors={['#1a0533', '#09090b']} style={StyleSheet.absoluteFill} />

        <View style={styles.logo}>
          <Ionicons name="flash" size={48} color={colors.accent} />
          <Text style={styles.title}>SassiFit</Text>
          <Text style={styles.subtitle}>Your AI-powered fitness companion</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={[styles.label, { marginTop: spacing.md }]}>Your Goal</Text>
          <View style={styles.goals}>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.goalBtn, goal === g && styles.goalBtnActive]}
                onPress={() => setGoal(g)}
              >
                <Text style={[styles.goalText, goal === g && styles.goalTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient colors={[colors.accent, '#7c3aed']} style={styles.startGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.startText}>Let's Go</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  logo: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 36, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 4 },
  form: { gap: spacing.sm },
  label: { fontSize: 13, color: colors.muted, fontWeight: '600', marginBottom: 4 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  goals: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  goalBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  goalBtnActive: { borderColor: colors.accent, backgroundColor: '#2e1065' },
  goalText: { color: colors.muted, fontSize: 13 },
  goalTextActive: { color: colors.accentLight, fontWeight: '600' },
  startBtn: { marginTop: spacing.lg, borderRadius: 14, overflow: 'hidden' },
  startGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, gap: spacing.sm },
  startText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
