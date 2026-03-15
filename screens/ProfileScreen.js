import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from './theme';
import { useApp } from './context/AppContext';
import { Card } from './components/UI';

const GOALS = ['Build Muscle', 'Lose Fat', 'Improve Endurance', 'Stay Active'];

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user.name);
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    setUser(prev => ({ ...prev, name: name.trim() || prev.name }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userGoal}>{user.goal}</Text>
        </View>

        {/* Edit Name */}
        <Card>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </Card>

        {/* Goal Selection */}
        <Card>
          <Text style={styles.label}>Fitness Goal</Text>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g}
              style={styles.goalRow}
              onPress={() => setUser(prev => ({ ...prev, goal: g }))}
            >
              <Text style={[styles.goalText, user.goal === g && styles.goalTextActive]}>{g}</Text>
              {user.goal === g && <Ionicons name="checkmark-circle" size={18} color={colors.accent} />}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Settings */}
        <Card>
          <Text style={styles.label}>Settings</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Workout Reminders</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace('Login')}>
          <Ionicons name="log-out-outline" size={18} color={colors.red} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  avatarSection: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.accent + '33',
    borderWidth: 2, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.accent },
  userName: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  userGoal: { fontSize: 13, color: colors.accentLight, marginTop: 2 },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: spacing.sm,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  goalText: { fontSize: 14, color: colors.muted },
  goalTextActive: { color: colors.text, fontWeight: '600' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 14, color: colors.text },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.red + '44',
    marginTop: spacing.sm,
  },
  logoutText: { color: colors.red, fontWeight: '600', fontSize: 15 },
});
