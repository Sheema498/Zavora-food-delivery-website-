/**
 * QuickBite Recipe & Culinary Catalog — North Indian Royal Mughlai & Punjabi Culinary Catalog
 * Complete dish specifications, ingredients, allergens, preparation steps, and pricing.
 */

export interface RecipeItem {
  id: string;
  name: string;
  cuisine: string;
  category: string;
  price: number;
  prepTimeMinutes: number;
  isVegetarian: boolean;
  description: string;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  allergens: string[];
  cookingInstructions: string[];
};

export const NORTHINDIAN_RECIPES: RecipeItem[] = [
  {
    id: 'dish-nor-1',
    name: 'Butter Chicken Deluxe',
    cuisine: 'North Indian',
    category: 'Main Course',
    price: 380.0,
    prepTimeMinutes: 25,
    isVegetarian: false,
    description: 'Tender roasted chicken tikka simmered in creamy satin tomato makhani gravy with fenugreek butter.',
    caloriesKcal: 806,
    proteinGrams: 50.8,
    carbsGrams: 70.4,
    fatsGrams: 29.2,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-nor-2',
    name: 'Paneer Tikka Masala',
    cuisine: 'North Indian',
    category: 'Starters',
    price: 340.0,
    prepTimeMinutes: 20,
    isVegetarian: true,
    description: 'Char-grilled cottage cheese cubes cooked in rich spiced bell pepper and onion tomato masala.',
    caloriesKcal: 758,
    proteinGrams: 32.0,
    carbsGrams: 67.2,
    fatsGrams: 27.6,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-nor-3',
    name: 'Dal Makhani Bukhara Style',
    cuisine: 'North Indian',
    category: 'Chef Special',
    price: 290.0,
    prepTimeMinutes: 30,
    isVegetarian: true,
    description: 'Slow-simmered black lentils cooked overnight on clay tandoor with churned country butter.',
    caloriesKcal: 698,
    proteinGrams: 29.5,
    carbsGrams: 63.2,
    fatsGrams: 25.6,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-nor-4',
    name: 'Mutton Rogan Josh',
    cuisine: 'North Indian',
    category: 'Beverages & Desserts',
    price: 480.0,
    prepTimeMinutes: 35,
    isVegetarian: false,
    description: 'Kashmiri style aromatic braised lamb shank in traditional ratan jot and fennel infused gravy.',
    caloriesKcal: 926,
    proteinGrams: 56.8,
    carbsGrams: 78.4,
    fatsGrams: 33.2,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-nor-5',
    name: 'Amritsari Kulcha Platter',
    cuisine: 'North Indian',
    category: 'Main Course',
    price: 220.0,
    prepTimeMinutes: 15,
    isVegetarian: true,
    description: 'Layered crispy sourdough flatbread stuffed with spiced potatoes served with pindi chana.',
    caloriesKcal: 614,
    proteinGrams: 26.0,
    carbsGrams: 57.6,
    fatsGrams: 22.8,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-nor-6',
    name: 'Tandoori Chicken Full',
    cuisine: 'North Indian',
    category: 'Starters',
    price: 450.0,
    prepTimeMinutes: 25,
    isVegetarian: false,
    description: 'Whole spring chicken marinated in yogurt, hung curd, Kashmiri deggi mirch, and mustard oil.',
    caloriesKcal: 890,
    proteinGrams: 55.0,
    carbsGrams: 76.0,
    fatsGrams: 32.0,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-nor-7',
    name: 'Kadhai Paneer',
    cuisine: 'North Indian',
    category: 'Chef Special',
    price: 330.0,
    prepTimeMinutes: 20,
    isVegetarian: true,
    description: 'Cottage cheese chunks tossed with fresh ground coriander seeds, dry red chillies, and bell peppers.',
    caloriesKcal: 746,
    proteinGrams: 31.5,
    carbsGrams: 66.4,
    fatsGrams: 27.2,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-nor-8',
    name: 'Murgh Malai Tikka',
    cuisine: 'North Indian',
    category: 'Beverages & Desserts',
    price: 360.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Boneless chicken skewers marinated in cashew cream, green cardamom, and melted cheese.',
    caloriesKcal: 782,
    proteinGrams: 49.6,
    carbsGrams: 68.8,
    fatsGrams: 28.4,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-nor-9',
    name: 'Palak Paneer Classic',
    cuisine: 'North Indian',
    category: 'Main Course',
    price: 320.0,
    prepTimeMinutes: 20,
    isVegetarian: true,
    description: 'Fresh spinach puree tempered with garlic, cumin, and mild spices with golden paneer cubes.',
    caloriesKcal: 734,
    proteinGrams: 31.0,
    carbsGrams: 65.6,
    fatsGrams: 26.8,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-nor-10',
    name: 'Garlic Naan & Laccha Paratha Combo',
    cuisine: 'North Indian',
    category: 'Starters',
    price: 160.0,
    prepTimeMinutes: 12,
    isVegetarian: false,
    description: 'Flaky whole-wheat paratha and tandoori garlic coriander naan brushed with pure desi ghee.',
    caloriesKcal: 542,
    proteinGrams: 37.6,
    carbsGrams: 52.8,
    fatsGrams: 20.4,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
];
