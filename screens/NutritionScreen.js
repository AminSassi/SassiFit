import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from './theme';
import { useApp } from './context/AppContext';
import { Card, ProgressBar } from './components/UI';

const FOODS = [
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Brown Rice (100g)', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
  { name: 'Egg (1 large)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Whey Protein (1 scoop)', calories: 120, protein: 25, carbs: 3, fat: 1.5 },
  { name: 'Oats (100g)', calories: 389, protein: 17, carbs: 66, fat: 7 },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Greek Yogurt (150g)', calories: 100, protein: 17, carbs: 6, fat: 0.7 },
];

const GOALS = { calories: 2500, protein: 180, carbs: 250, fat: 70 };

export default function NutritionScreen() {
  const { nutrition, logMeal, resetNutrition } = useApp();
  const [search, setSearch] = useState('');

  const filtered = FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (food) => {
    logMeal(food);
    Alert.alert('✅ Added!', `${food.name} logged.`);
  };

  const macros = [
    { label: 'Calories', value: nutrition.calories, goal: GOALS.calories, unit: 'kcal', color: colors.orange },
    { label: 'Protein', value: nutrition.protein, goal: GOALS.protein, unit: 'g', color: colors.green },
    { label: 'Carbs', value: nutrition.carbs, goal: GOALS.carbs, unit: 'g', color: '#38bdf8' },
    { label: 'Fat', value: nutrition.fat, goal: GOALS.fat, unit: 'g', color: colors.red },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Nutrition</Text>
          <TouchableOpacity onPress={resetNutrition}>
            <Text style={styles.resetText}>Reset Day</Text>
          </TouchableOpacity>
        </View>

        {/* Macro Progress */}
        <Card>
          {macros.map(m => (
            <View key={m.label} style={styles.macroRow}>
              <View style={styles.macroLabelRow}>
                <Text style={styles.macroLabel}>{m.label}</Text>
                <Text style={[styles.macroValue, { color: m.color }]}>
                  {Math.round(m.value)}<Text style={styles.macroGoal}>/{m.goal}{m.unit}</Text>
                </Text>
              </View>
              <ProgressBar value={m.value} max={m.goal} color={m.color} />
            </View>
          ))}
        </Card>

        {/* Food Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Food List */}
        {filtered.map((food, i) => (
          <Card key={i}>
            <View style={styles.foodRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodMeta}>
                  {food.calories} kcal · P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g
                </Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(food)}>
                <Ionicons name="add" size={20} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text },
  resetText: { fontSize: 13, color: colors.red },
  macroRow: { marginBottom: spacing.sm },
  macroLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroLabel: { fontSize: 13, color: colors.muted },
  macroValue: { fontSize: 13, fontWeight: '700' },
  macroGoal: { fontSize: 11, color: colors.muted, fontWeight: '400' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, color: colors.text, paddingVertical: spacing.sm, fontSize: 14 },
  foodRow: { flexDirection: 'row', alignItems: 'center' },
  foodName: { fontSize: 14, fontWeight: '600', color: colors.text },
  foodMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
