/**
 * QuickBite Recipe & Culinary Catalog — South Indian Coastal & Tiffin Specialties Catalog
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

export const SOUTHINDIAN_RECIPES: RecipeItem[] = [
  {
    id: 'dish-sou-1',
    name: 'Ghee Roast Mysore Masala Dosa',
    cuisine: 'South Indian',
    category: 'Main Course',
    price: 180.0,
    prepTimeMinutes: 15,
    isVegetarian: true,
    description: 'Crispy golden fermented crepe smeared with spicy red garlic chutney and spiced potato mash.',
    caloriesKcal: 566,
    proteinGrams: 24.0,
    carbsGrams: 54.4,
    fatsGrams: 21.2,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-sou-2',
    name: 'Chettinad Pepper Chicken',
    cuisine: 'South Indian',
    category: 'Starters',
    price: 390.0,
    prepTimeMinutes: 25,
    isVegetarian: false,
    description: 'Authentic Karaikudi style spicy chicken cooked with star anise, stone flower, and freshly cracked peppercorns.',
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
    id: 'dish-sou-3',
    name: 'Mangalore Ghee Roast Prawns',
    cuisine: 'South Indian',
    category: 'Chef Special',
    price: 490.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Tiger prawns tossed in fiery Byadgi chilli paste, curry leaves, and clarified country butter.',
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
    id: 'dish-sou-4',
    name: 'Kerala Style Malabar Parotta with Veg Kurma',
    cuisine: 'South Indian',
    category: 'Beverages & Desserts',
    price: 240.0,
    prepTimeMinutes: 18,
    isVegetarian: false,
    description: 'Flaky multi-layered parottas served with rich coconut milk and vegetable stew.',
    caloriesKcal: 638,
    proteinGrams: 42.4,
    carbsGrams: 59.2,
    fatsGrams: 23.6,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-sou-5',
    name: 'Hyderabadi Dum Biryani Royal',
    cuisine: 'South Indian',
    category: 'Main Course',
    price: 420.0,
    prepTimeMinutes: 30,
    isVegetarian: false,
    description: 'Aromatic long-grain basmati rice layered with marinated meat, saffron, fried onions, and kewra water.',
    caloriesKcal: 854,
    proteinGrams: 53.2,
    carbsGrams: 73.6,
    fatsGrams: 30.8,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-sou-6',
    name: 'Andhra Chilli Chicken Dry',
    cuisine: 'South Indian',
    category: 'Starters',
    price: 350.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Crispy chicken tossed with fiery green chillies, curry leaves, and ginger garlic paste.',
    caloriesKcal: 770,
    proteinGrams: 49.0,
    carbsGrams: 68.0,
    fatsGrams: 28.0,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-sou-7',
    name: 'Traditional Rava Onion Masala Dosa',
    cuisine: 'South Indian',
    category: 'Chef Special',
    price: 190.0,
    prepTimeMinutes: 15,
    isVegetarian: true,
    description: 'Lacy semolina crepe studded with chopped green chillies, ginger, cashews, and onions.',
    caloriesKcal: 578,
    proteinGrams: 24.5,
    carbsGrams: 55.2,
    fatsGrams: 21.6,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-sou-8',
    name: 'Appam with Vegetable Coconut Stew',
    cuisine: 'South Indian',
    category: 'Beverages & Desserts',
    price: 210.0,
    prepTimeMinutes: 15,
    isVegetarian: true,
    description: 'Soft-centered bowl-shaped rice hoppers with rich aromatic cardamom coconut milk stew.',
    caloriesKcal: 602,
    proteinGrams: 25.5,
    carbsGrams: 56.8,
    fatsGrams: 22.4,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-sou-9',
    name: 'Coorg Pandi Pork Style Masala',
    cuisine: 'South Indian',
    category: 'Main Course',
    price: 460.0,
    prepTimeMinutes: 30,
    isVegetarian: false,
    description: 'Classic kodava dark spiced curry simmered in kachampuli vinegar and wild coriander.',
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
    id: 'dish-sou-10',
    name: 'Authentic Filter Coffee & Medu Vada Combo',
    cuisine: 'South Indian',
    category: 'Starters',
    price: 140.0,
    prepTimeMinutes: 10,
    isVegetarian: true,
    description: 'Crispy golden urad dal fritters served with coconut chutney and hot Kumbakonam degree filter coffee.',
    caloriesKcal: 518,
    proteinGrams: 22.0,
    carbsGrams: 51.2,
    fatsGrams: 19.6,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
];
