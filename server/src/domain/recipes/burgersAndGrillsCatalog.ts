/**
 * QuickBite Recipe & Culinary Catalog — Gourmet American Burgers & Smokehouse BBQ Catalog
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

export const BURGERSANDGRILLS_RECIPES: RecipeItem[] = [
  {
    id: 'dish-bur-1',
    name: 'Double Smoked Bacon Cheeseburger',
    cuisine: 'American',
    category: 'Main Course',
    price: 440.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Double smashed prime beef patties, applewood smoked bacon, aged yellow cheddar, and brioche bun.',
    caloriesKcal: 878,
    proteinGrams: 54.4,
    carbsGrams: 75.2,
    fatsGrams: 31.6,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-bur-2',
    name: 'Crispy Buttermilk Buffalo Chicken Burger',
    cuisine: 'American',
    category: 'Starters',
    price: 390.0,
    prepTimeMinutes: 18,
    isVegetarian: false,
    description: 'Southern style buttermilk brined fried chicken breast dipped in fiery buffalo sauce with ranch slaw.',
    caloriesKcal: 818,
    proteinGrams: 51.4,
    carbsGrams: 71.2,
    fatsGrams: 29.6,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-bur-3',
    name: 'Truffle Melt Smash Burger',
    cuisine: 'American',
    category: 'Chef Special',
    price: 460.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Two smashed smashed patties topped with truffle aioli, sautéed cremini mushrooms, and Swiss gruyere.',
    caloriesKcal: 902,
    proteinGrams: 55.6,
    carbsGrams: 76.8,
    fatsGrams: 32.4,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-bur-4',
    name: 'Smoked Texas BBQ Pork Ribs',
    cuisine: 'American',
    category: 'Beverages & Desserts',
    price: 590.0,
    prepTimeMinutes: 30,
    isVegetarian: false,
    description: 'Fall-off-the-bone tender baby back ribs slow-smoked over hickory wood with tangy molasses BBQ glaze.',
    caloriesKcal: 1058,
    proteinGrams: 63.4,
    carbsGrams: 87.2,
    fatsGrams: 37.6,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-bur-5',
    name: 'Loaded Pulled Pork Dirty Fries',
    cuisine: 'American',
    category: 'Main Course',
    price: 320.0,
    prepTimeMinutes: 15,
    isVegetarian: false,
    description: 'Crisp skin-on french fries loaded with 14-hour smoked pulled pork, cheese sauce, and pickled jalapeños.',
    caloriesKcal: 734,
    proteinGrams: 47.2,
    carbsGrams: 65.6,
    fatsGrams: 26.8,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-bur-6',
    name: 'Gourmet Plant-Based Beyond Burger',
    cuisine: 'American',
    category: 'Starters',
    price: 450.0,
    prepTimeMinutes: 18,
    isVegetarian: true,
    description: '100% plant-based grilled patty with vegan smoked gouda, lettuce, heirloom tomato, and house secret sauce.',
    caloriesKcal: 890,
    proteinGrams: 37.5,
    carbsGrams: 76.0,
    fatsGrams: 32.0,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-bur-7',
    name: 'Southern Fried Chicken Tenders with Honey Mustard',
    cuisine: 'American',
    category: 'Chef Special',
    price: 310.0,
    prepTimeMinutes: 15,
    isVegetarian: false,
    description: 'Hand-breaded golden crispy chicken tenderloins served with house-made honey dijon dipping sauce.',
    caloriesKcal: 722,
    proteinGrams: 46.6,
    carbsGrams: 64.8,
    fatsGrams: 26.4,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-bur-8',
    name: 'Philly Cheesesteak Sub Sandwich',
    cuisine: 'American',
    category: 'Beverages & Desserts',
    price: 430.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Shaved ribeye steak sautéed with caramelized onions and bell peppers smothered in melted provolone.',
    caloriesKcal: 866,
    proteinGrams: 53.8,
    carbsGrams: 74.4,
    fatsGrams: 31.2,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-bur-9',
    name: 'Classic Buffalo Wings (10 Pcs)',
    cuisine: 'American',
    category: 'Main Course',
    price: 360.0,
    prepTimeMinutes: 18,
    isVegetarian: false,
    description: 'Crisp jumbo wings tossed in signature red cayenne pepper sauce served with celery sticks and blue cheese dip.',
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
    id: 'dish-bur-10',
    name: 'New York Baked Cheesecake with Strawberry Compote',
    cuisine: 'American',
    category: 'Starters',
    price: 260.0,
    prepTimeMinutes: 10,
    isVegetarian: true,
    description: 'Dense and velvety cream cheese cake on graham cracker crust topped with fresh berry coulis.',
    caloriesKcal: 662,
    proteinGrams: 28.0,
    carbsGrams: 60.8,
    fatsGrams: 24.4,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
];
