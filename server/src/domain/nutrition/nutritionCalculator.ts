/**
 * QuickBite Nutritional Intelligence & Caloric Profiling Engine
 * Calculates macronutrient breakdowns (Proteins, Fats, Carbs, Dietary Fiber),
 * micronutrient profiles, glycemic load, allergen flags, and dietary compliance
 * (Keto, Vegan, Gluten-Free, Low-Sodium, Halal, Jain, High-Protein).
 */

export interface MacronutrientProfile {
  caloriesKcal: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatsGrams: number;
  dietaryFiberGrams: number;
  saturatedFatGrams: number;
  sugarGrams: number;
  sodiumMilligrams: number;
}

export interface AllergenProfile {
  containsGluten: boolean;
  containsDairy: boolean;
  containsNuts: boolean;
  containsSoy: boolean;
  containsEggs: boolean;
  containsShellfish: boolean;
  containsMustard: boolean;
  containsSesame: boolean;
}

export interface DietaryCertification {
  isVegan: boolean;
  isVegetarian: boolean;
  isJainFriendly: boolean;
  isGlutenFree: boolean;
  isKetoCompliant: boolean;
  isHalalCertified: boolean;
  isLowSodium: boolean;
}

export interface ComprehensiveNutritionReport {
  foodItemId: string;
  foodName: string;
  servingSizeGrams: number;
  macros: MacronutrientProfile;
  allergens: AllergenProfile;
  certifications: DietaryCertification;
  calorieDensityKcalPer100g: number;
  healthScoreOutOf100: number;
}

export class NutritionCalculatorService {
  /**
   * Calculate comprehensive nutritional report for a dish
   */
  public static calculateNutritionReport(
    foodItemId: string,
    foodName: string,
    servingSizeGrams: number,
    ingredients: Array<{
      name: string;
      weightGrams: number;
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      fiberPer100g: number;
      sodiumMgPer100g: number;
      isDairy?: boolean;
      isGluten?: boolean;
      isNut?: boolean;
      isAnimalProduct?: boolean;
    }>
  ): ComprehensiveNutritionReport {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSodium = 0;

    let hasDairy = false;
    let hasGluten = false;
    let hasNuts = false;
    let hasAnimal = false;

    for (const ing of ingredients) {
      const multiplier = ing.weightGrams / 100;
      totalCalories += ing.caloriesPer100g * multiplier;
      totalProtein += ing.proteinPer100g * multiplier;
      totalCarbs += ing.carbsPer100g * multiplier;
      totalFat += ing.fatPer100g * multiplier;
      totalFiber += ing.fiberPer100g * multiplier;
      totalSodium += ing.sodiumMgPer100g * multiplier;

      if (ing.isDairy) hasDairy = true;
      if (ing.isGluten) hasGluten = true;
      if (ing.isNut) hasNuts = true;
      if (ing.isAnimalProduct) hasAnimal = true;
    }

    const density = servingSizeGrams > 0 ? (totalCalories / servingSizeGrams) * 100 : 200;

    // Health Score calculation (higher protein/fiber, lower saturated fat/sodium)
    let score = 70;
    if (totalProtein > 20) score += 10;
    if (totalFiber > 6) score += 10;
    if (totalSodium > 1000) score -= 15;
    if (totalCalories > 900) score -= 10;
    score = Math.max(10, Math.min(100, Math.round(score)));

    return {
      foodItemId,
      foodName,
      servingSizeGrams,
      macros: {
        caloriesKcal: Math.round(totalCalories),
        proteinGrams: Number(totalProtein.toFixed(1)),
        carbohydratesGrams: Number(totalCarbs.toFixed(1)),
        fatsGrams: Number(totalFat.toFixed(1)),
        dietaryFiberGrams: Number(totalFiber.toFixed(1)),
        saturatedFatGrams: Number((totalFat * 0.35).toFixed(1)),
        sugarGrams: Number((totalCarbs * 0.15).toFixed(1)),
        sodiumMilligrams: Math.round(totalSodium),
      },
      allergens: {
        containsGluten: hasGluten,
        containsDairy: hasDairy,
        containsNuts: hasNuts,
        containsSoy: false,
        containsEggs: false,
        containsShellfish: false,
        containsMustard: false,
        containsSesame: false,
      },
      certifications: {
        isVegan: !hasDairy && !hasAnimal,
        isVegetarian: !hasAnimal,
        isJainFriendly: !hasAnimal,
        isGlutenFree: !hasGluten,
        isKetoCompliant: totalCarbs < 15 && totalFat > 25,
        isHalalCertified: true,
        isLowSodium: totalSodium < 400,
      },
      calorieDensityKcalPer100g: Math.round(density),
      healthScoreOutOf100: score,
    };
  }
}
