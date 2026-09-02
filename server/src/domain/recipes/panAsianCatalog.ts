/**
 * QuickBite Recipe & Culinary Catalog — Pan-Asian Sushi, Dim Sum & Wok Kitchen Catalog
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

export const PANASIAN_RECIPES: RecipeItem[] = [
  {
    id: 'dish-pan-1',
    name: 'Salmon & Avocado Uramaki Sushi Roll',
    cuisine: 'Pan-Asian',
    category: 'Main Course',
    price: 580.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Fresh Atlantic salmon, ripe hass avocado, toasted sesame seeds, and pickled ginger with wasabi.',
    caloriesKcal: 1046,
    proteinGrams: 62.8,
    carbsGrams: 86.4,
    fatsGrams: 37.2,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-pan-2',
    name: 'Truffle Edamame & Cream Cheese Dim Sum',
    cuisine: 'Pan-Asian',
    category: 'Starters',
    price: 420.0,
    prepTimeMinutes: 15,
    isVegetarian: true,
    description: 'Steamed translucent crystal dumplings stuffed with crushed edamame beans and truffle oil.',
    caloriesKcal: 854,
    proteinGrams: 36.0,
    carbsGrams: 73.6,
    fatsGrams: 30.8,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-pan-3',
    name: 'Bangkok Style Pad Thai Noodles',
    cuisine: 'Pan-Asian',
    category: 'Chef Special',
    price: 380.0,
    prepTimeMinutes: 18,
    isVegetarian: false,
    description: 'Flat rice noodles stir-fried with tamarind sauce, crushed peanuts, bean sprouts, and lime.',
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
    id: 'dish-pan-4',
    name: 'Spicy Kung Pao Chicken with Cashews',
    cuisine: 'Pan-Asian',
    category: 'Beverages & Desserts',
    price: 410.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Diced chicken wok-tossed with dried Sichuan chillies, crunchy cashews, and scallions in dark sweet soy.',
    caloriesKcal: 842,
    proteinGrams: 52.6,
    carbsGrams: 72.8,
    fatsGrams: 30.4,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-pan-5',
    name: 'Japanese Pork Belly Tonkotsu Ramen',
    cuisine: 'Pan-Asian',
    category: 'Main Course',
    price: 490.0,
    prepTimeMinutes: 25,
    isVegetarian: false,
    description: 'Rich 12-hour pork bone broth, springy ramen noodles, chashu pork, ajitsuke tamago egg, and nori.',
    caloriesKcal: 938,
    proteinGrams: 57.4,
    carbsGrams: 79.2,
    fatsGrams: 33.6,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-pan-6',
    name: 'Steamed Prawn Har Gow Dim Sum',
    cuisine: 'Pan-Asian',
    category: 'Starters',
    price: 460.0,
    prepTimeMinutes: 15,
    isVegetarian: false,
    description: 'Traditional Cantonese steamed dumplings with juicy bamboo shoot and wild caught prawn filling.',
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
    id: 'dish-pan-7',
    name: 'Indonesian Nasi Goreng Special',
    cuisine: 'Pan-Asian',
    category: 'Chef Special',
    price: 390.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Spiced fried rice served with chicken satay skewers, peanut sauce, crispy kerupuk, and sunny-side egg.',
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
    id: 'dish-pan-8',
    name: 'Crispy Prawn Tempura with Tsuyu Dip',
    cuisine: 'Pan-Asian',
    category: 'Beverages & Desserts',
    price: 480.0,
    prepTimeMinutes: 15,
    isVegetarian: false,
    description: 'Light and airy panko crusted tiger prawns served with grated daikon radish and mirin soy dipping sauce.',
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
    id: 'dish-pan-9',
    name: 'Thai Green Coconut Curry with Jasmine Rice',
    cuisine: 'Pan-Asian',
    category: 'Main Course',
    price: 430.0,
    prepTimeMinutes: 22,
    isVegetarian: false,
    description: 'Fragrant green curry with lemongrass, kaffir lime, galangal, bamboo shoots, and coconut cream.',
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
    id: 'dish-pan-10',
    name: 'Crispy Honey Chilli Lotus Stem',
    cuisine: 'Pan-Asian',
    category: 'Starters',
    price: 290.0,
    prepTimeMinutes: 14,
    isVegetarian: false,
    description: 'Crunchy thinly sliced lotus stems glazed in sweet and spicy chilli honey sauce and toasted sesame.',
    caloriesKcal: 698,
    proteinGrams: 45.4,
    carbsGrams: 63.2,
    fatsGrams: 25.6,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
];
