import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting QuickBite database seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.restaurantReview.deleteMany({});
  await prisma.deliveryLocationHistory.deleteMany({});
  await prisma.deliveryAssignment.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.foodItem.deleteMany({});
  await prisma.foodCategory.deleteMany({});
  await prisma.restaurantStaff.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.deliveryPartnerProfile.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing database records.');

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('Password123!', salt);

  // 1. System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'COMMISSION_RATE', value: '0.15', description: 'Platform fee percentage (15%)', group: 'COMMISSION' },
      { key: 'TAX_RATE', value: '5.0', description: 'Goods & Services Tax (5%)', group: 'GENERAL' },
      { key: 'BASE_DELIVERY_FEE', value: '40.0', description: 'Default base delivery fee in INR', group: 'DELIVERY' },
      { key: 'FREE_DELIVERY_THRESHOLD', value: '500.0', description: 'Order total for free delivery eligibility', group: 'DELIVERY' },
    ],
  });

  // 2. Active Coupons
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 2);

  await prisma.coupon.createMany({
    data: [
      {
        code: 'QUICK50',
        description: 'Get 50% OFF up to ₹100 on orders above ₹199',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minOrderAmount: 199,
        maxDiscountAmount: 100,
        validUntil,
        isActive: true,
      },
      {
        code: 'WELCOME100',
        description: 'Flat ₹100 OFF on your first gourmet order above ₹299',
        discountType: 'FLAT',
        discountValue: 100,
        minOrderAmount: 299,
        validUntil,
        isActive: true,
      },
      {
        code: 'TASTY20',
        description: '20% OFF on all restaurant orders up to ₹75',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 149,
        maxDiscountAmount: 75,
        validUntil,
        isActive: true,
      },
    ],
  });

  // 3. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@quickbite.com',
      passwordHash: commonPasswordHash,
      name: 'System Administrator',
      phone: '+91 99001 00001',
      role: 'ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 4. Customer Users & Addresses
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash: commonPasswordHash,
      name: 'Alex Johnson',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      customerProfile: {
        create: {
          preferredLanguage: 'en',
          loyaltyPoints: 120,
          totalSpent: 1450.0,
        },
      },
    },
  });

  const customer1AddressHome = await prisma.address.create({
    data: {
      userId: customer1.id,
      label: 'Home',
      recipientName: 'Alex Johnson',
      phone: '+91 98765 43210',
      streetAddress: 'Apartment 402, Prestige Towers, Residency Road',
      landmark: 'Near Bishop Cotton School',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560025',
      latitude: 12.9698,
      longitude: 77.6033,
      isDefault: true,
    },
  });

  const customer1AddressWork = await prisma.address.create({
    data: {
      userId: customer1.id,
      label: 'Work',
      recipientName: 'Alex Johnson',
      phone: '+91 98765 43210',
      streetAddress: 'Tech Park Zone B, 5th Floor, UB City',
      landmark: 'Vittal Mallya Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9719,
      longitude: 77.5958,
      isDefault: false,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'priya.customer@example.com',
      passwordHash: commonPasswordHash,
      name: 'Priya Sharma',
      phone: '+91 98111 22233',
      role: 'CUSTOMER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      customerProfile: {
        create: {
          preferredLanguage: 'en',
          loyaltyPoints: 85,
          totalSpent: 890.0,
        },
      },
    },
  });

  await prisma.address.create({
    data: {
      userId: customer2.id,
      label: 'Home',
      recipientName: 'Priya Sharma',
      phone: '+91 98111 22233',
      streetAddress: 'Villa 14, Palm Meadows, Whitefield',
      landmark: 'Near Forum Value Mall',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      latitude: 12.9698,
      longitude: 77.7499,
      isDefault: true,
    },
  });

  // 5. Delivery Partners
  const driverUser1 = await prisma.user.create({
    data: {
      email: 'arjun.driver@quickbite.com',
      passwordHash: commonPasswordHash,
      name: 'Arjun Kumar',
      phone: '+91 91234 56789',
      role: 'DELIVERY_PARTNER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const driver1Profile = await prisma.deliveryPartnerProfile.create({
    data: {
      userId: driverUser1.id,
      vehicleType: 'MOTORBIKE',
      vehicleNumber: 'KA-01-EQ-4421',
      licenseNumber: 'DL-2021-00984',
      isOnline: true,
      isAvailable: true,
      currentLatitude: 12.9735,
      currentLongitude: 77.5992,
      rating: 4.9,
      totalDeliveries: 142,
      totalEarnings: 6390.0,
    },
  });

  const driverUser2 = await prisma.user.create({
    data: {
      email: 'kiran.driver@quickbite.com',
      passwordHash: commonPasswordHash,
      name: 'Kiran Reddy',
      phone: '+91 92345 67890',
      role: 'DELIVERY_PARTNER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const driver2Profile = await prisma.deliveryPartnerProfile.create({
    data: {
      userId: driverUser2.id,
      vehicleType: 'SCOOTER',
      vehicleNumber: 'KA-05-MK-8819',
      licenseNumber: 'DL-2022-11452',
      isOnline: true,
      isAvailable: true,
      currentLatitude: 12.9680,
      currentLongitude: 77.5910,
      rating: 4.8,
      totalDeliveries: 98,
      totalEarnings: 4410.0,
    },
  });

  const driverUser3 = await prisma.user.create({
    data: {
      email: 'ravi.driver@quickbite.com',
      passwordHash: commonPasswordHash,
      name: 'Ravi Verma',
      phone: '+91 93456 78901',
      role: 'DELIVERY_PARTNER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    },
  });

  await prisma.deliveryPartnerProfile.create({
    data: {
      userId: driverUser3.id,
      vehicleType: 'BICYCLE',
      vehicleNumber: 'CY-BLR-041',
      licenseNumber: 'DL-2023-44102',
      isOnline: false,
      isAvailable: true,
      currentLatitude: 12.9650,
      currentLongitude: 77.6080,
      rating: 4.7,
      totalDeliveries: 45,
      totalEarnings: 2025.0,
    },
  });

  // 6. Restaurants & Restaurant Owners
  // Restaurant 1: Pizza Hub
  const owner1 = await prisma.user.create({
    data: {
      email: 'owner@pizzahub.com',
      passwordHash: commonPasswordHash,
      name: 'Marco Rossi',
      phone: '+91 98888 11111',
      role: 'RESTAURANT',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    },
  });

  const restPizzaHub = await prisma.restaurant.create({
    data: {
      name: 'Pizza Hub & Italian Trattoria',
      slug: 'pizza-hub-italian-trattoria',
      description: 'Artisanal wood-fired sourdough pizzas, fresh hand-rolled pasta, and authentic Italian gelato.',
      phone: '+91 80 4123 9999',
      email: 'info@pizzahub.com',
      logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=1200',
      address: '88 Brigade Road, Ashok Nagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560025',
      latitude: 12.9725,
      longitude: 77.6075,
      isOpen: true,
      isFeatured: true,
      cuisineTypes: 'Italian, Pizza, Pasta, European',
      priceRange: '$$',
      rating: 4.8,
      totalRatings: 342,
      avgPrepTimeMinutes: 20,
      deliveryFee: 40.0,
      minOrderAmount: 150.0,
      commissionRate: 0.15,
      totalRevenue: 42500.0,
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: owner1.id, restaurantId: restPizzaHub.id, role: 'OWNER' },
  });

  // Menu categories and items for Pizza Hub
  const catPizzas = await prisma.foodCategory.create({
    data: { restaurantId: restPizzaHub.id, name: 'Wood-Fired Pizzas', slug: 'wood-fired-pizzas', displayOrder: 1 },
  });
  const catPastas = await prisma.foodCategory.create({
    data: { restaurantId: restPizzaHub.id, name: 'Handcrafted Pastas', slug: 'handcrafted-pastas', displayOrder: 2 },
  });
  const catSides = await prisma.foodCategory.create({
    data: { restaurantId: restPizzaHub.id, name: 'Sides & Beverages', slug: 'sides-beverages', displayOrder: 3 },
  });

  const pizzaItemMargherita = await prisma.foodItem.create({
    data: {
      restaurantId: restPizzaHub.id,
      categoryId: catPizzas.id,
      name: 'Classic Margherita Napoletana',
      description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fragrant sweet basil, and extra virgin olive oil.',
      price: 349.0,
      discountPrice: 299.0,
      imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 18,
      calories: 780,
      displayOrder: 1,
    },
  });

  const pizzaItemPepperoni = await prisma.foodItem.create({
    data: {
      restaurantId: restPizzaHub.id,
      categoryId: catPizzas.id,
      name: 'Spicy Smoked Pepperoni Feast',
      description: 'Loaded with imported artisanal pepperoni, shredded mozzarella, spicy jalapeños, and hot honey drizzle.',
      price: 499.0,
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
      isVegetarian: false,
      isSpicy: true,
      isBestSeller: true,
      prepTimeMinutes: 20,
      calories: 950,
      displayOrder: 2,
    },
  });

  const pizzaItemTruffleMushroom = await prisma.foodItem.create({
    data: {
      restaurantId: restPizzaHub.id,
      categoryId: catPizzas.id,
      name: 'Wild Truffle & Shiitake Mushroom Pizza',
      description: 'Roasted forest mushrooms, creamy fontina cheese, thyme, and fragrant black truffle oil on a crispy crust.',
      price: 449.0,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
      isVegetarian: true,
      prepTimeMinutes: 20,
      calories: 820,
      displayOrder: 3,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restPizzaHub.id,
      categoryId: catPastas.id,
      name: 'Creamy Fettuccine Alfredo',
      description: 'Tossed in rich aged Parmigiano Reggiano butter sauce with crushed garlic and cracked black pepper.',
      price: 379.0,
      imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500',
      isVegetarian: true,
      prepTimeMinutes: 15,
      calories: 680,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restPizzaHub.id,
      categoryId: catSides.id,
      name: 'Cheesy Stuffed Garlic Bread',
      description: 'Freshly baked sourdough baguettes stuffed with gooey mozzarella and herb butter dip.',
      price: 189.0,
      imageUrl: 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=500',
      isVegetarian: true,
      prepTimeMinutes: 12,
      calories: 420,
      displayOrder: 1,
    },
  });

  // Restaurant 2: Burger Craft
  const owner2 = await prisma.user.create({
    data: {
      email: 'owner@burgercraft.com',
      passwordHash: commonPasswordHash,
      name: 'Chef David Miller',
      phone: '+91 98888 22222',
      role: 'RESTAURANT',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
  });

  const restBurgerCraft = await prisma.restaurant.create({
    data: {
      name: 'Burger Craft & Shake Lab',
      slug: 'burger-craft-shake-lab',
      description: 'Gourmet smashed beef burgers, crispy peri-peri chicken stacks, and thick Belgian monster milkshakes.',
      phone: '+91 80 4222 8888',
      email: 'info@burgercraft.com',
      logoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200',
      address: '42 Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      isOpen: true,
      isFeatured: true,
      cuisineTypes: 'Burgers, American, Fast Food, Shakes',
      priceRange: '$$',
      rating: 4.7,
      totalRatings: 289,
      avgPrepTimeMinutes: 18,
      deliveryFee: 35.0,
      minOrderAmount: 120.0,
      commissionRate: 0.15,
      totalRevenue: 38200.0,
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: owner2.id, restaurantId: restBurgerCraft.id, role: 'OWNER' },
  });

  const catBurgers = await prisma.foodCategory.create({
    data: { restaurantId: restBurgerCraft.id, name: 'Signature Smashed Burgers', slug: 'signature-smashed-burgers', displayOrder: 1 },
  });
  const catShakes = await prisma.foodCategory.create({
    data: { restaurantId: restBurgerCraft.id, name: 'Thick Monster Shakes', slug: 'thick-monster-shakes', displayOrder: 2 },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restBurgerCraft.id,
      categoryId: catBurgers.id,
      name: 'The Ultimate Double Smashed Cheeseburger',
      description: 'Double tender patties smashed with caramelized onions, American cheddar cheese, dill pickles, and secret house sauce in brioche buns.',
      price: 329.0,
      discountPrice: 289.0,
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500',
      isVegetarian: false,
      isBestSeller: true,
      prepTimeMinutes: 15,
      calories: 890,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restBurgerCraft.id,
      categoryId: catBurgers.id,
      name: 'Crispy Peri-Peri Fried Chicken Burger',
      description: 'Golden fried chicken breast tossed in spicy African peri-peri glaze, crunchy purple cabbage slaw, and chipotle mayo.',
      price: 299.0,
      imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500',
      isVegetarian: false,
      isSpicy: true,
      prepTimeMinutes: 16,
      calories: 740,
      displayOrder: 2,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restBurgerCraft.id,
      categoryId: catShakes.id,
      name: 'Nutella Ferrero Rocher Shake',
      description: 'Rich Belgian chocolate shake blended with genuine Nutella spread, whole hazelnuts, and topped with whipped cream.',
      price: 229.0,
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
      isVegetarian: true,
      prepTimeMinutes: 8,
      calories: 540,
      displayOrder: 1,
    },
  });

  // Restaurant 3: Royal Biryani Darbar
  const restBiryani = await prisma.restaurant.create({
    data: {
      name: 'Royal Dum Biryani Darbar',
      slug: 'royal-dum-biryani-darbar',
      description: 'Slow-cooked royal Hyderabadi and Lucknowi dum biryanis made with long-grain basmati and secret Mughal spices.',
      phone: '+91 80 4333 7777',
      email: 'biryani@royalbiryani.com',
      logoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200',
      address: '15 Koramangala 5th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560095',
      latitude: 12.9352,
      longitude: 77.6245,
      isOpen: true,
      isFeatured: true,
      cuisineTypes: 'Biryani, Mughlai, North Indian, Kebabs',
      priceRange: '$$',
      rating: 4.9,
      totalRatings: 512,
      avgPrepTimeMinutes: 25,
      deliveryFee: 40.0,
      minOrderAmount: 200.0,
      commissionRate: 0.15,
      totalRevenue: 76000.0,
    },
  });

  const catBiryani = await prisma.foodCategory.create({
    data: { restaurantId: restBiryani.id, name: 'Royal Dum Biryanis', slug: 'royal-dum-biryanis', displayOrder: 1 },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restBiryani.id,
      categoryId: catBiryani.id,
      name: 'Hyderabadi Special Dum Chicken Biryani',
      description: 'Fragrant saffron basmati rice layered with succulent tender chicken cuts slow-cooked in traditional copper handi with raita and mirchi ka salan.',
      price: 369.0,
      discountPrice: 329.0,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
      isVegetarian: false,
      isSpicy: true,
      isBestSeller: true,
      prepTimeMinutes: 20,
      calories: 920,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restBiryani.id,
      categoryId: catBiryani.id,
      name: 'Paneer Tikka Dum Biryani',
      description: 'Char-grilled cottage cheese cubes layered with spiced basmati rice, caramelized mint, and fried cashews.',
      price: 319.0,
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500',
      isVegetarian: true,
      prepTimeMinutes: 18,
      calories: 780,
      displayOrder: 2,
    },
  });

  // Restaurant 4: Spice Route North Indian
  const restNorthIndian = await prisma.restaurant.create({
    data: {
      name: 'Spice Route North Indian & Tandoor',
      slug: 'spice-route-north-indian-tandoor',
      description: 'Traditional slow-simmered Punjabi gravies, butter chicken, rich dal makhani, and clay oven tandoori rotis.',
      phone: '+91 80 4444 6666',
      email: 'spiceroute@quickbite.com',
      logoUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200',
      address: '24 MG Road, Central Business District',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9750,
      longitude: 77.6050,
      isOpen: true,
      isFeatured: true,
      cuisineTypes: 'North Indian, Mughlai, Punjabi, Tandoor',
      priceRange: '$$',
      rating: 4.8,
      totalRatings: 420,
      avgPrepTimeMinutes: 22,
      deliveryFee: 35.0,
      minOrderAmount: 180.0,
      commissionRate: 0.15,
      totalRevenue: 54000.0,
    },
  });

  const catNorthCurries = await prisma.foodCategory.create({
    data: { restaurantId: restNorthIndian.id, name: 'North Indian Curries', slug: 'north-indian-curries', displayOrder: 1 },
  });
  const catTandoor = await prisma.foodCategory.create({
    data: { restaurantId: restNorthIndian.id, name: 'Tandoori Breads & Kebabs', slug: 'tandoori-breads-kebabs', displayOrder: 2 },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restNorthIndian.id,
      categoryId: catNorthCurries.id,
      name: 'Royal Murgh Makhani (Butter Chicken)',
      description: 'Charcoal-grilled chicken tikkas simmered in silky tomato, cashew, and fresh butter gravy with fenugreek.',
      price: 389.0,
      discountPrice: 349.0,
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
      isVegetarian: false,
      isBestSeller: true,
      prepTimeMinutes: 20,
      calories: 820,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restNorthIndian.id,
      categoryId: catNorthCurries.id,
      name: 'Dal Makhani Slow-Simmered Overnight',
      description: 'Whole black urad lentils slow-cooked for 16 hours on charcoal with pure ghee, cream, and ginger.',
      price: 279.0,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 15,
      calories: 610,
      displayOrder: 2,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restNorthIndian.id,
      categoryId: catTandoor.id,
      name: 'Butter Garlic Naan (2 Pcs)',
      description: 'Hand-stretched leavened flatbread brushed with crushed roasted garlic, fresh cilantro, and melted butter.',
      price: 119.0,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
      isVegetarian: true,
      prepTimeMinutes: 10,
      calories: 320,
      displayOrder: 1,
    },
  });

  // Restaurant 5: Dosa Junction South Indian
  const restSouthIndian = await prisma.restaurant.create({
    data: {
      name: 'Dosa Junction & Filter Coffee',
      slug: 'dosa-junction-filter-coffee',
      description: 'Crispy golden ghee roast dosas, steamed fluffy idlis, crunchy medu vadas, and authentic Kumbakonam degree filter coffee.',
      phone: '+91 80 4555 3333',
      email: 'dosajunction@quickbite.com',
      logoUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=1200',
      address: '77 Malleshwaram 8th Cross',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560003',
      latitude: 13.0031,
      longitude: 77.5684,
      isOpen: true,
      isFeatured: true,
      cuisineTypes: 'South Indian, Vegetarian, Breakfast, Snacks, Beverages',
      priceRange: '$',
      rating: 4.9,
      totalRatings: 630,
      avgPrepTimeMinutes: 15,
      deliveryFee: 30.0,
      minOrderAmount: 100.0,
      commissionRate: 0.15,
      totalRevenue: 68000.0,
    },
  });

  const catDosas = await prisma.foodCategory.create({
    data: { restaurantId: restSouthIndian.id, name: 'South Indian Specials', slug: 'south-indian-specials', displayOrder: 1 },
  });
  const catBeverages = await prisma.foodCategory.create({
    data: { restaurantId: restSouthIndian.id, name: 'Beverages & Filter Coffee', slug: 'beverages-filter-coffee', displayOrder: 2 },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restSouthIndian.id,
      categoryId: catDosas.id,
      name: 'Benne Ghee Roast Masala Dosa',
      description: 'Crispy fermented rice crepe roasted in aromatic country butter (benne), stuffed with spiced potato mash, served with 3 chutneys and piping hot drumstick sambar.',
      price: 189.0,
      discountPrice: 159.0,
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 12,
      calories: 520,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restSouthIndian.id,
      categoryId: catDosas.id,
      name: 'Ghee Podi Idli Platter (4 Pcs)',
      description: 'Mini steamed rice cakes tossed in fiery spicy gunpowder podi masala and sizzling desi ghee.',
      price: 149.0,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
      isVegetarian: true,
      prepTimeMinutes: 10,
      calories: 380,
      displayOrder: 2,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restSouthIndian.id,
      categoryId: catBeverages.id,
      name: 'Authentic Madras Filter Coffee (Double Shot)',
      description: 'Freshly brewed chicory coffee decoction frothed with boiled whole milk in brass davarah-tumbler set.',
      price: 79.0,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
      isVegetarian: true,
      prepTimeMinutes: 5,
      calories: 110,
      displayOrder: 1,
    },
  });

  // Restaurant 6: Dragon Wok Chinese & Dim Sum
  const restChinese = await prisma.restaurant.create({
    data: {
      name: 'Dragon Wok Chinese & Dim Sum Lab',
      slug: 'dragon-wok-chinese-dim-sum-lab',
      description: 'Steamed translucent dim sums, fiery Hakka noodles, crispy spring rolls, and wok-tossed Schezwan fried rice.',
      phone: '+91 80 4666 2222',
      email: 'dragonwok@quickbite.com',
      logoUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200',
      address: '90 Lavelle Road, Shanthala Nagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9710,
      longitude: 77.5990,
      isOpen: true,
      isFeatured: true,
      cuisineTypes: 'Chinese, Asian, Dim Sum, Noodles',
      priceRange: '$$',
      rating: 4.7,
      totalRatings: 380,
      avgPrepTimeMinutes: 18,
      deliveryFee: 35.0,
      minOrderAmount: 150.0,
      commissionRate: 0.15,
      totalRevenue: 49000.0,
    },
  });

  const catChinese = await prisma.foodCategory.create({
    data: { restaurantId: restChinese.id, name: 'Chinese Noodles & Dim Sum', slug: 'chinese-noodles-dim-sum', displayOrder: 1 },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restChinese.id,
      categoryId: catChinese.id,
      name: 'Crispy Veg Spring Rolls with Sweet Chilli (6 Pcs)',
      description: 'Golden fried crispy pastry rolls filled with shredded cabbage, carrots, scallions, and glass noodles.',
      price: 199.0,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
      isVegetarian: true,
      prepTimeMinutes: 12,
      calories: 340,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restChinese.id,
      categoryId: catChinese.id,
      name: 'Fiery Schezwan Chilli Garlic Noodles',
      description: 'Wok-tossed handmade wheat noodles with roasted red chillies, bell peppers, spring onions, and spicy Schezwan oil.',
      price: 249.0,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
      isVegetarian: true,
      isSpicy: true,
      prepTimeMinutes: 15,
      calories: 580,
      displayOrder: 2,
    },
  });

  // Restaurant 7: Green Earth Healthy Superfoods & Desserts
  const restHealthy = await prisma.restaurant.create({
    data: {
      name: 'Green Earth Healthy Bowls & Desserts',
      slug: 'green-earth-healthy-bowls-desserts',
      description: 'Nutrient-rich protein superfood bowls, cold-pressed fruit elixirs, organic quinoa salads, and sugar-free desserts.',
      phone: '+91 80 4777 1111',
      email: 'greenearth@quickbite.com',
      logoUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200',
      address: '12 Richmond Town, Victoria Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560047',
      latitude: 12.9655,
      longitude: 77.6105,
      isOpen: true,
      isFeatured: true,
      cuisineTypes: 'Healthy, Salads, Desserts, Snacks, Beverages',
      priceRange: '$$',
      rating: 4.8,
      totalRatings: 290,
      avgPrepTimeMinutes: 15,
      deliveryFee: 35.0,
      minOrderAmount: 150.0,
      commissionRate: 0.15,
      totalRevenue: 34000.0,
    },
  });

  const catHealthy = await prisma.foodCategory.create({
    data: { restaurantId: restHealthy.id, name: 'Healthy Superfood Bowls', slug: 'healthy-superfood-bowls', displayOrder: 1 },
  });
  const catDesserts = await prisma.foodCategory.create({
    data: { restaurantId: restHealthy.id, name: 'Artisanal Desserts & Snacks', slug: 'artisanal-desserts-snacks', displayOrder: 2 },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restHealthy.id,
      categoryId: catHealthy.id,
      name: 'Avocado & Grilled Paneer Power Bowl',
      description: 'Hass avocado slices, organic tri-color quinoa, baby spinach, edamame beans, and roasted almond flakes with citrus dressing.',
      price: 349.0,
      discountPrice: 299.0,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 12,
      calories: 460,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: restHealthy.id,
      categoryId: catDesserts.id,
      name: 'Dark Chocolate Lava Cake with Berry Coulis',
      description: 'Warm molten 70% Belgian dark chocolate cake with gooey center, fresh raspberries, and dusting of cocoa.',
      price: 249.0,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
      isVegetarian: true,
      prepTimeMinutes: 10,
      calories: 490,
      displayOrder: 1,
    },
  });

  // 7. Sample Orders for Testing and Demonstration

  // Sample Order 1: DELIVERED order with Customer Review
  const deliveredOrder = await prisma.order.create({
    data: {
      orderNumber: 'QB-1001',
      customerId: customer1.id,
      restaurantId: restPizzaHub.id,
      deliveryPartnerId: driver1Profile.id,
      addressId: customer1AddressHome.id,
      status: 'DELIVERED',
      subtotal: 598.0,
      taxAmount: 29.9,
      deliveryFee: 0.0,
      discountAmount: 100.0, // WELCOME100 applied
      tipAmount: 30.0,
      totalAmount: 557.9,
      paymentMethod: 'ONLINE_DEMO_PAY',
      paymentStatus: 'PAID',
      deliveryAddressSnapshot: JSON.stringify({
        label: 'Home',
        recipientName: 'Alex Johnson',
        phone: '+91 98765 43210',
        streetAddress: customer1AddressHome.streetAddress,
        city: customer1AddressHome.city,
        state: customer1AddressHome.state,
        postalCode: customer1AddressHome.postalCode,
        latitude: customer1AddressHome.latitude,
        longitude: customer1AddressHome.longitude,
      }),
      customerNotes: 'Please ring doorbell and leave at door',
      placedAt: new Date(Date.now() - 3600000 * 3), // 3 hours ago
      acceptedAt: new Date(Date.now() - 3600000 * 2.8),
      readyAt: new Date(Date.now() - 3600000 * 2.5),
      assignedAt: new Date(Date.now() - 3600000 * 2.4),
      pickedUpAt: new Date(Date.now() - 3600000 * 2.2),
      deliveredAt: new Date(Date.now() - 3600000 * 2.0),
      items: {
        create: [
          {
            foodItemId: pizzaItemMargherita.id,
            name: pizzaItemMargherita.name,
            quantity: 2,
            unitPrice: 299.0,
            totalPrice: 598.0,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', notes: 'Order placed by customer' },
          { status: 'RESTAURANT_ACCEPTED', notes: 'Accepted with 20 min prep time' },
          { status: 'PREPARING', notes: 'Chef is baking the pizza' },
          { status: 'READY_FOR_PICKUP', notes: 'Boxed and ready' },
          { status: 'DELIVERY_ASSIGNED', notes: 'Assigned to Arjun Kumar' },
          { status: 'DELIVERY_ACCEPTED', notes: 'Driver accepted assignment' },
          { status: 'PICKED_UP', notes: 'Driver picked up package' },
          { status: 'ON_THE_WAY', notes: 'Out for delivery' },
          { status: 'DELIVERED', notes: 'Package delivered at doorstep' },
        ],
      },
    },
  });

  // Review for Delivered Order
  await prisma.restaurantReview.create({
    data: {
      restaurantId: restPizzaHub.id,
      customerId: customer1.id,
      orderId: deliveredOrder.id,
      rating: 5,
      comment: 'Super fast delivery and the Margherita was piping hot with genuine sourdough crust! 5 stars.',
      replyFromRestaurant: 'Thank you Alex! We take huge pride in our wood-fired sourdough pizzas!',
      isVerified: true,
    },
  });

  // Sample Order 2: READY_FOR_PICKUP order (Ready for Admin Assignment demo!)
  await prisma.order.create({
    data: {
      orderNumber: 'QB-1024',
      customerId: customer1.id,
      restaurantId: restPizzaHub.id,
      addressId: customer1AddressWork.id,
      status: 'READY_FOR_PICKUP',
      subtotal: 499.0,
      taxAmount: 25.0,
      deliveryFee: 40.0,
      discountAmount: 0.0,
      tipAmount: 20.0,
      totalAmount: 584.0,
      paymentMethod: 'ONLINE_DEMO_PAY',
      paymentStatus: 'PAID',
      deliveryAddressSnapshot: JSON.stringify({
        label: 'Work',
        recipientName: 'Alex Johnson',
        phone: '+91 98765 43210',
        streetAddress: customer1AddressWork.streetAddress,
        city: customer1AddressWork.city,
        state: customer1AddressWork.state,
        postalCode: customer1AddressWork.postalCode,
        latitude: customer1AddressWork.latitude,
        longitude: customer1AddressWork.longitude,
      }),
      customerNotes: 'Deliver to 5th floor reception',
      placedAt: new Date(Date.now() - 1800000), // 30 mins ago
      acceptedAt: new Date(Date.now() - 1500000),
      readyAt: new Date(Date.now() - 300000), // 5 mins ago
      items: {
        create: [
          {
            foodItemId: pizzaItemPepperoni.id,
            name: pizzaItemPepperoni.name,
            quantity: 1,
            unitPrice: 499.0,
            totalPrice: 499.0,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', notes: 'Order placed by customer' },
          { status: 'RESTAURANT_ACCEPTED', notes: 'Accepted by Pizza Hub' },
          { status: 'PREPARING', notes: 'Food cooking in progress' },
          { status: 'READY_FOR_PICKUP', notes: 'Packed and waiting for delivery partner assignment' },
        ],
      },
    },
  });

  // Sample Order 3: ON_THE_WAY active order with live driver tracking
  const onTheWayOrder = await prisma.order.create({
    data: {
      orderNumber: 'QB-1025',
      customerId: customer2.id,
      restaurantId: restPizzaHub.id,
      deliveryPartnerId: driver2Profile.id,
      addressId: customer1AddressHome.id,
      status: 'ON_THE_WAY',
      subtotal: 449.0,
      taxAmount: 22.45,
      deliveryFee: 40.0,
      discountAmount: 0.0,
      tipAmount: 0.0,
      totalAmount: 511.45,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      deliveryAddressSnapshot: JSON.stringify({
        label: 'Home',
        recipientName: 'Priya Sharma',
        phone: '+91 98111 22233',
        streetAddress: 'Apartment 402, Prestige Towers, Residency Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560025',
        latitude: 12.9698,
        longitude: 77.6033,
      }),
      placedAt: new Date(Date.now() - 2400000),
      acceptedAt: new Date(Date.now() - 2000000),
      readyAt: new Date(Date.now() - 1200000),
      assignedAt: new Date(Date.now() - 1100000),
      pickedUpAt: new Date(Date.now() - 600000),
      items: {
        create: [
          {
            foodItemId: pizzaItemTruffleMushroom.id,
            name: pizzaItemTruffleMushroom.name,
            quantity: 1,
            unitPrice: 449.0,
            totalPrice: 449.0,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', notes: 'Order placed' },
          { status: 'RESTAURANT_ACCEPTED', notes: 'Accepted' },
          { status: 'PREPARING', notes: 'In kitchen' },
          { status: 'READY_FOR_PICKUP', notes: 'Ready' },
          { status: 'DELIVERY_ASSIGNED', notes: 'Assigned to Kiran Reddy' },
          { status: 'DELIVERY_ACCEPTED', notes: 'Accepted by driver' },
          { status: 'PICKED_UP', notes: 'Picked up from restaurant' },
          { status: 'ON_THE_WAY', notes: 'Driver is moving towards customer' },
        ],
      },
    },
  });

  // Add sample driver location track for Order 3
  await prisma.deliveryLocationHistory.createMany({
    data: [
      {
        deliveryPartnerId: driver2Profile.id,
        orderId: onTheWayOrder.id,
        latitude: 12.9725,
        longitude: 77.6075,
        heading: 210,
        speed: 18.5,
        timestamp: new Date(Date.now() - 500000),
      },
      {
        deliveryPartnerId: driver2Profile.id,
        orderId: onTheWayOrder.id,
        latitude: 12.9712,
        longitude: 77.6050,
        heading: 205,
        speed: 22.0,
        timestamp: new Date(Date.now() - 250000),
      },
      {
        deliveryPartnerId: driver2Profile.id,
        orderId: onTheWayOrder.id,
        latitude: 12.9705,
        longitude: 77.6040,
        heading: 195,
        speed: 15.0,
        timestamp: new Date(),
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('  DEMO CREDENTIALS:');
  console.log('  • Admin:              admin@quickbite.com          / Password123!');
  console.log('  • Customer 1:         customer@example.com         / Password123!');
  console.log('  • Customer 2:         priya.customer@example.com   / Password123!');
  console.log('  • Restaurant Owner 1: owner@pizzahub.com           / Password123!');
  console.log('  • Restaurant Owner 2: owner@burgercraft.com        / Password123!');
  console.log('  • Driver 1 (Online):  arjun.driver@quickbite.com   / Password123!');
  console.log('  • Driver 2 (Online):  kiran.driver@quickbite.com   / Password123!');
  console.log('  • Driver 3 (Offline): ravi.driver@quickbite.com    / Password123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
