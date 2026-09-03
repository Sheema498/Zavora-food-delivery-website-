/**
 * QuickBite Recipe & Culinary Catalog — Artisanal Italian Wood-Fired & Pasta Catalog
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

export const ITALIANGOURMET_RECIPES: RecipeItem[] = [
  {
    id: 'dish-ita-1',
    name: 'Neapolitan Margherita D.O.P.',
    cuisine: 'Italian',
    category: 'Main Course',
    price: 420.0,
    prepTimeMinutes: 18,
    isVegetarian: true,
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fragrant Genovese basil, and extra virgin olive oil.',
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
    id: 'dish-ita-2',
    name: 'Truffle Wild Mushroom Fettuccine',
    cuisine: 'Italian',
    category: 'Starters',
    price: 480.0,
    prepTimeMinutes: 20,
    isVegetarian: true,
    description: 'Handmade egg fettuccine tossed in white truffle oil, porcini mushrooms, and 24-month aged Parmigiano-Reggiano.',
    caloriesKcal: 926,
    proteinGrams: 39.0,
    carbsGrams: 78.4,
    fatsGrams: 33.2,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-ita-3',
    name: 'Quattro Formaggi Artisanal Pizza',
    cuisine: 'Italian',
    category: 'Chef Special',
    price: 520.0,
    prepTimeMinutes: 20,
    isVegetarian: false,
    description: 'Four cheese blend of Mozzarella, Gorgonzola, Fontina, and Smoked Scamorza on sourdough crust.',
    caloriesKcal: 974,
    proteinGrams: 59.2,
    carbsGrams: 81.6,
    fatsGrams: 34.8,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-ita-4',
    name: 'Spaghetti Cacio e Pepe',
    cuisine: 'Italian',
    category: 'Beverages & Desserts',
    price: 390.0,
    prepTimeMinutes: 15,
    isVegetarian: false,
    description: 'Artisanal bronze-cut spaghetti emulsified with Pecorino Romano and toasted black tellicherry peppercorns.',
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
    id: 'dish-ita-5',
    name: 'Classic Burrata Caprese Salad',
    cuisine: 'Italian',
    category: 'Main Course',
    price: 410.0,
    prepTimeMinutes: 12,
    isVegetarian: true,
    description: 'Creamy artisanal pugliese burrata cheese, heirloom cherry tomatoes, basil pesto, and balsamic glaze.',
    caloriesKcal: 842,
    proteinGrams: 35.5,
    carbsGrams: 72.8,
    fatsGrams: 30.4,
    allergens: ["Dairy", "Gluten"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-ita-6',
    name: 'Slow-Cooked Bolognese Tagliatelle',
    cuisine: 'Italian',
    category: 'Starters',
    price: 460.0,
    prepTimeMinutes: 22,
    isVegetarian: false,
    description: 'Traditional meat ragù slow-simmered for 6 hours with Chianti red wine, tomatoes, and soffritto.',
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
    id: 'dish-ita-7',
    name: 'Wood-Fired Pepperoni Diavola Pizza',
    cuisine: 'Italian',
    category: 'Chef Special',
    price: 540.0,
    prepTimeMinutes: 18,
    isVegetarian: false,
    description: 'Spicy Italian cured pork pepperoni, calabrian chilli honey, crushed tomatoes, and fior di latte.',
    caloriesKcal: 998,
    proteinGrams: 60.4,
    carbsGrams: 83.2,
    fatsGrams: 35.6,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-ita-8',
    name: 'Wild Porcini Mushroom Risotto',
    cuisine: 'Italian',
    category: 'Beverages & Desserts',
    price: 450.0,
    prepTimeMinutes: 25,
    isVegetarian: false,
    description: 'Carnaroli rice cooked in rich vegetable broth with dried porcini, white wine, and butter mantecatura.',
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
    id: 'dish-ita-9',
    name: 'Homemade Classic Tiramisu',
    cuisine: 'Italian',
    category: 'Main Course',
    price: 280.0,
    prepTimeMinutes: 10,
    isVegetarian: false,
    description: 'Savoiardi ladyfingers soaked in espresso and dark rum layered with rich mascarpone zabaglione.',
    caloriesKcal: 686,
    proteinGrams: 44.8,
    carbsGrams: 62.4,
    fatsGrams: 25.2,
    allergens: ["Gluten", "Poultry/Meat"],
    cookingInstructions: [
      'Step 1: Prep fresh raw ingredients and preheat commercial kitchen wok/oven.',
      'Step 2: Sauté aromatics and blend reduction simmer for optimal flavor integration.',
      'Step 3: Plate freshly cooked portion into food-grade tamper-evident thermal container.',
    ],
  },
  {
    id: 'dish-ita-10',
    name: 'Artisanal Rosemary Sea Salt Focaccia',
    cuisine: 'Italian',
    category: 'Starters',
    price: 180.0,
    prepTimeMinutes: 12,
    isVegetarian: true,
    description: 'Fluffy high-hydration Ligurian flatbread baked with fresh rosemary, extra virgin olive oil, and Maldon flakes.',
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
];
