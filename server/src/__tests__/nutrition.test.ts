import { describe, it, expect } from 'vitest';
import { NutritionCalculatorService } from '../domain/nutrition/nutritionCalculator.js';

describe('Nutrition & Calorie Calculations', () => {
  it('should compute macros and health score for balanced dish', () => {
    const ingredients = [
      { name: 'Grilled Chicken Breast', weightGrams: 150, caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, sodiumMgPer100g: 74, isAnimalProduct: true },
      { name: 'Steamed Brown Rice', weightGrams: 100, caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, fiberPer100g: 1.8, sodiumMgPer100g: 5 },
      { name: 'Broccoli Florets', weightGrams: 80, caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, fiberPer100g: 2.6, sodiumMgPer100g: 33 },
    ];

    const report = NutritionCalculatorService.calculateNutritionReport('dish-1', 'Fit Protein Bowl', 330, ingredients);
    expect(report.macros.caloriesKcal).toBeGreaterThan(300);
    expect(report.macros.proteinGrams).toBeGreaterThan(45);
    expect(report.certifications.isVegetarian).toBe(false);
    expect(report.healthScoreOutOf100).toBeGreaterThanOrEqual(80);
  });
});
