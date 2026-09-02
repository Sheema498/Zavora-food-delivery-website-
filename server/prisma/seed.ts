import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ZAVORA database seeding...');

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
  await prisma.deliveryPartnerProfile.deleteMany({});
  await prisma.restaurant.deleteMany({});
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
        code: 'ZAVORA50',
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

  // 3. Super Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'System Super Administrator',
      phone: '+91 99001 00001',
      role: 'SUPER_ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // Also seed legacy admin email pointing to super admin
  await prisma.user.create({
    data: {
      email: 'admin@quickbite.com',
      passwordHash: commonPasswordHash,
      name: 'Admin QuickBite Alias',
      phone: '+91 99001 00002',
      role: 'ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 4. Customers & Delivery Addresses
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
          loyaltyPoints: 160,
          totalSpent: 1850.0,
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
          loyaltyPoints: 95,
          totalSpent: 1120.0,
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

  // ==========================================
  // EXACTLY SIX RESTAURANTS & DEDICATED COURIERS
  // ==========================================

  // --- RESTAURANT 1: Zavora Pizza House ---
  const owner1 = await prisma.user.create({
    data: {
      email: 'owner1@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Chef Marco Rossi (Pizza House)',
      phone: '+91 98888 11111',
      role: 'RESTAURANT_ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    },
  });

  const rest1 = await prisma.restaurant.create({
    data: {
      name: 'Zavora Pizza House',
      slug: 'zavora-pizza-house',
      description: 'Artisanal wood-fired sourdough pizzas, hand-stretched mozzarella, authentic pastas, and crisp Italian starters.',
      phone: '+91 80 4123 9901',
      email: 'pizzahouse@zavora.com',
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
      cuisineTypes: 'Pizza, Italian, Pasta, Snacks, Beverages',
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
    data: { userId: owner1.id, restaurantId: rest1.id, role: 'OWNER' },
  });

  const driverUser1 = await prisma.user.create({
    data: {
      email: 'partner1@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Arjun Kumar (Dedicated Courier 1)',
      phone: '+91 91234 56781',
      role: 'DELIVERY_PARTNER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const driverProfile1 = await prisma.deliveryPartnerProfile.create({
    data: {
      userId: driverUser1.id,
      restaurantId: rest1.id,
      vehicleType: 'MOTORBIKE',
      vehicleNumber: 'KA-01-ZV-1001',
      licenseNumber: 'DL-2021-00981',
      isOnline: true,
      isAvailable: true,
      currentLatitude: 12.9735,
      currentLongitude: 77.5992,
      rating: 4.9,
      totalDeliveries: 142,
      totalEarnings: 6390.0,
    },
  });

  const cat1Pizza = await prisma.foodCategory.create({
    data: { restaurantId: rest1.id, name: 'Pizza', slug: 'pizza', displayOrder: 1 },
  });
  const cat1Pasta = await prisma.foodCategory.create({
    data: { restaurantId: rest1.id, name: 'North Indian', slug: 'north-indian-starters', displayOrder: 2 },
  });
  const cat1Snacks = await prisma.foodCategory.create({
    data: { restaurantId: rest1.id, name: 'Snacks', slug: 'snacks', displayOrder: 3 },
  });
  const cat1Bev = await prisma.foodCategory.create({
    data: { restaurantId: rest1.id, name: 'Beverages', slug: 'beverages', displayOrder: 4 },
  });

  const item1Margherita = await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: cat1Pizza.id,
      name: 'Margherita Pizza',
      description: 'San Marzano tomato sauce, fresh buffalo mozzarella, sweet basil, and cold-pressed extra virgin olive oil.',
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

  const item1Farmhouse = await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: cat1Pizza.id,
      name: 'Farmhouse Pizza',
      description: 'Loaded with crisp bell peppers, grilled mushrooms, sweet corn, sliced black olives, and melted mozzarella.',
      price: 429.0,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 20,
      calories: 820,
      displayOrder: 2,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: cat1Pizza.id,
      name: 'Paneer Pizza',
      description: 'Marinated tikka spiced paneer cubes, red onions, capsicum, and fresh mint mayo on hand-tossed dough.',
      price: 399.0,
      discountPrice: 359.0,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
      isVegetarian: true,
      prepTimeMinutes: 18,
      calories: 840,
      displayOrder: 3,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: cat1Pizza.id,
      name: 'Cheese Burst Pizza',
      description: 'Liquid gold molten cheese flooded inside the crust topped with double cheddar and jalapeño slices.',
      price: 479.0,
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
      isVegetarian: true,
      isSpicy: true,
      prepTimeMinutes: 22,
      calories: 980,
      displayOrder: 4,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: cat1Snacks.id,
      name: 'Cheesy Garlic Bread',
      description: 'Freshly baked sourdough baguettes generously brushed with garlic herb butter and stuffed with molten mozzarella.',
      price: 189.0,
      imageUrl: 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=500',
      isVegetarian: true,
      prepTimeMinutes: 12,
      calories: 420,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: cat1Pasta.id,
      name: 'Creamy Fettuccine Alfredo Pasta',
      description: 'Silky egg ribbons tossed in aged Parmigiano Reggiano butter sauce with crushed garlic and cracked black pepper.',
      price: 379.0,
      imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500',
      isVegetarian: true,
      prepTimeMinutes: 16,
      calories: 680,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: cat1Bev.id,
      name: 'Sparkling Italian Lemonade',
      description: 'Pressed Sicilian lemons with sparkling mineral water, fresh mint, and cane sugar syrup.',
      price: 129.0,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500',
      isVegetarian: true,
      prepTimeMinutes: 5,
      calories: 120,
      displayOrder: 1,
    },
  });

  // --- RESTAURANT 2: Spice Route Biryani ---
  const owner2 = await prisma.user.create({
    data: {
      email: 'owner2@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Chef Zubair Ahmed (Spice Route)',
      phone: '+91 98888 22222',
      role: 'RESTAURANT_ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150',
    },
  });

  const rest2 = await prisma.restaurant.create({
    data: {
      name: 'Spice Route Biryani',
      slug: 'spice-route-biryani',
      description: 'Slow-cooked royal Hyderabadi and Lucknowi dum biryanis, succulent charcoal kebabs, and fragrant saffron rice.',
      phone: '+91 80 4333 7702',
      email: 'biryani@zavora.com',
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
      cuisineTypes: 'Biryani, Mughlai, North Indian, Snacks, Beverages',
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

  await prisma.restaurantStaff.create({
    data: { userId: owner2.id, restaurantId: rest2.id, role: 'OWNER' },
  });

  const driverUser2 = await prisma.user.create({
    data: {
      email: 'partner2@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Kiran Reddy (Dedicated Courier 2)',
      phone: '+91 92345 67892',
      role: 'DELIVERY_PARTNER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const driverProfile2 = await prisma.deliveryPartnerProfile.create({
    data: {
      userId: driverUser2.id,
      restaurantId: rest2.id,
      vehicleType: 'MOTORBIKE',
      vehicleNumber: 'KA-05-ZV-2002',
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

  const cat2Biryani = await prisma.foodCategory.create({
    data: { restaurantId: rest2.id, name: 'Biryani', slug: 'biryani', displayOrder: 1 },
  });
  const cat2North = await prisma.foodCategory.create({
    data: { restaurantId: rest2.id, name: 'North Indian', slug: 'north-indian', displayOrder: 2 },
  });
  const cat2Snacks = await prisma.foodCategory.create({
    data: { restaurantId: rest2.id, name: 'Snacks', slug: 'snacks', displayOrder: 3 },
  });
  const cat2Bev = await prisma.foodCategory.create({
    data: { restaurantId: rest2.id, name: 'Beverages', slug: 'beverages', displayOrder: 4 },
  });

  const item2ChickenBiryani = await prisma.foodItem.create({
    data: {
      restaurantId: rest2.id,
      categoryId: cat2Biryani.id,
      name: 'Hyderabadi Chicken Biryani',
      description: 'Fragrant saffron basmati rice layered with succulent chicken cuts slow-cooked in sealed copper handi with raita and mirchi ka salan.',
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
      restaurantId: rest2.id,
      categoryId: cat2Biryani.id,
      name: 'Royal Mutton Biryani',
      description: 'Tender baby mutton pieces marinated in ginger-garlic paste and curd, steam cooked in basmati with rose water essence.',
      price: 469.0,
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500',
      isVegetarian: false,
      isSpicy: true,
      isBestSeller: true,
      prepTimeMinutes: 25,
      calories: 1040,
      displayOrder: 2,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest2.id,
      categoryId: cat2Biryani.id,
      name: 'Paneer Biryani',
      description: 'Char-grilled cottage cheese cubes layered with spiced basmati rice, caramelized onions, fresh mint, and fried cashews.',
      price: 319.0,
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500',
      isVegetarian: true,
      prepTimeMinutes: 18,
      calories: 780,
      displayOrder: 3,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest2.id,
      categoryId: cat2Biryani.id,
      name: 'Egg Biryani Special',
      description: 'Hard-boiled farm eggs roasted in brown gravy and nestled within aromatic golden saffron rice.',
      price: 279.0,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
      isVegetarian: false,
      prepTimeMinutes: 15,
      calories: 710,
      displayOrder: 4,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest2.id,
      categoryId: cat2Snacks.id,
      name: 'Crispy Chicken 65',
      description: 'Spicy deep-fried chicken morsels tossed with curry leaves, crushed green chillies, and ginger-lime glaze.',
      price: 289.0,
      discountPrice: 249.0,
      imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500',
      isVegetarian: false,
      isSpicy: true,
      prepTimeMinutes: 15,
      calories: 520,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest2.id,
      categoryId: cat2North.id,
      name: 'Creamy Boondi & Mint Raita',
      description: 'Whisked fresh curd with crisp salted chickpea boondi, roasted cumin seeds, and fresh garden mint.',
      price: 89.0,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
      isVegetarian: true,
      prepTimeMinutes: 5,
      calories: 140,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest2.id,
      categoryId: cat2Bev.id,
      name: 'Thick Mango Lassi',
      description: 'Alphonso mango pulp blended with rich fresh dahi, a hint of green cardamom, and chopped pistachios.',
      price: 139.0,
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
      isVegetarian: true,
      prepTimeMinutes: 6,
      calories: 280,
      displayOrder: 1,
    },
  });

  // --- RESTAURANT 3: Burger District ---
  const owner3 = await prisma.user.create({
    data: {
      email: 'owner3@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Chef David Miller (Burger District)',
      phone: '+91 98888 33333',
      role: 'RESTAURANT_ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
  });

  const rest3 = await prisma.restaurant.create({
    data: {
      name: 'Burger District',
      slug: 'burger-district',
      description: 'Gourmet smashed beef burgers, crunchy buttermilk fried chicken stacks, loaded crinkle fries, and thick milkshakes.',
      phone: '+91 80 4222 8803',
      email: 'burgers@zavora.com',
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
      cuisineTypes: 'Burgers, American, Snacks, Beverages',
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
    data: { userId: owner3.id, restaurantId: rest3.id, role: 'OWNER' },
  });

  const driverUser3 = await prisma.user.create({
    data: {
      email: 'partner3@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Ravi Verma (Dedicated Courier 3)',
      phone: '+91 93456 78903',
      role: 'DELIVERY_PARTNER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    },
  });

  const driverProfile3 = await prisma.deliveryPartnerProfile.create({
    data: {
      userId: driverUser3.id,
      restaurantId: rest3.id,
      vehicleType: 'SCOOTER',
      vehicleNumber: 'KA-03-ZV-3003',
      licenseNumber: 'DL-2023-44103',
      isOnline: true,
      isAvailable: true,
      currentLatitude: 12.9790,
      currentLongitude: 77.6390,
      rating: 4.8,
      totalDeliveries: 75,
      totalEarnings: 3375.0,
    },
  });

  const cat3Burgers = await prisma.foodCategory.create({
    data: { restaurantId: rest3.id, name: 'Burgers', slug: 'burgers', displayOrder: 1 },
  });
  const cat3Snacks = await prisma.foodCategory.create({
    data: { restaurantId: rest3.id, name: 'Snacks', slug: 'snacks', displayOrder: 2 },
  });
  const cat3Bev = await prisma.foodCategory.create({
    data: { restaurantId: rest3.id, name: 'Beverages', slug: 'beverages', displayOrder: 3 },
  });

  const item3Smashed = await prisma.foodItem.create({
    data: {
      restaurantId: rest3.id,
      categoryId: cat3Burgers.id,
      name: 'Classic Double Smashed Cheeseburger',
      description: 'Double tender patties smashed with caramelized onions, aged cheddar cheese, dill pickles, and secret house relish in toasted brioche buns.',
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
      restaurantId: rest3.id,
      categoryId: cat3Burgers.id,
      name: 'Crispy Peri-Peri Chicken Burger',
      description: 'Golden fried chicken breast tossed in fiery African peri-peri glaze, crunchy purple cabbage slaw, and chipotle mayo.',
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
      restaurantId: rest3.id,
      categoryId: cat3Burgers.id,
      name: 'Truffle Mushroom Swiss Burger',
      description: 'Grilled portobello mushrooms, melted Swiss Emmental cheese, caramelized shallots, and fragrant truffle mayo.',
      price: 349.0,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      isVegetarian: true,
      prepTimeMinutes: 16,
      calories: 720,
      displayOrder: 3,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest3.id,
      categoryId: cat3Snacks.id,
      name: 'Loaded Cheesy Bacon Fries',
      description: 'Crispy golden crinkle cut potato fries drenched in warm cheddar sauce, scallions, and smoky seasonings.',
      price: 199.0,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500',
      isVegetarian: true,
      prepTimeMinutes: 10,
      calories: 550,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest3.id,
      categoryId: cat3Bev.id,
      name: 'Monster Nutella Milkshake',
      description: 'Rich Belgian chocolate ice cream blended with authentic Nutella spread, hazelnuts, whipped cream, and chocolate fudge.',
      price: 229.0,
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
      isVegetarian: true,
      prepTimeMinutes: 8,
      calories: 540,
      displayOrder: 1,
    },
  });

  // --- RESTAURANT 4: South Bowl Kitchen ---
  const owner4 = await prisma.user.create({
    data: {
      email: 'owner4@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Chef Raghavan Iyer (South Bowl)',
      phone: '+91 98888 44444',
      role: 'RESTAURANT_ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const rest4 = await prisma.restaurant.create({
    data: {
      name: 'South Bowl Kitchen',
      slug: 'south-bowl-kitchen',
      description: 'Crispy golden benne dosas, ghee podi steamed idlis, crunchy medu vadas, authentic sambar, and Kumbakonam degree filter coffee.',
      phone: '+91 80 4555 3304',
      email: 'southbowl@zavora.com',
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
      cuisineTypes: 'South Indian, Vegetarian, Healthy Food, Snacks, Beverages',
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

  await prisma.restaurantStaff.create({
    data: { userId: owner4.id, restaurantId: rest4.id, role: 'OWNER' },
  });

  const driverUser4 = await prisma.user.create({
    data: {
      email: 'partner4@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Suresh Naidu (Dedicated Courier 4)',
      phone: '+91 94567 89014',
      role: 'DELIVERY_PARTNER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const driverProfile4 = await prisma.deliveryPartnerProfile.create({
    data: {
      userId: driverUser4.id,
      restaurantId: rest4.id,
      vehicleType: 'MOTORBIKE',
      vehicleNumber: 'KA-04-ZV-4004',
      licenseNumber: 'DL-2021-33104',
      isOnline: true,
      isAvailable: true,
      currentLatitude: 13.0040,
      currentLongitude: 77.5690,
      rating: 4.9,
      totalDeliveries: 110,
      totalEarnings: 4950.0,
    },
  });

  const cat4South = await prisma.foodCategory.create({
    data: { restaurantId: rest4.id, name: 'South Indian', slug: 'south-indian', displayOrder: 1 },
  });
  const cat4Healthy = await prisma.foodCategory.create({
    data: { restaurantId: rest4.id, name: 'Healthy Food', slug: 'healthy-food', displayOrder: 2 },
  });
  const cat4Snacks = await prisma.foodCategory.create({
    data: { restaurantId: rest4.id, name: 'Snacks', slug: 'snacks', displayOrder: 3 },
  });
  const cat4Bev = await prisma.foodCategory.create({
    data: { restaurantId: rest4.id, name: 'Beverages', slug: 'beverages', displayOrder: 4 },
  });

  const item4Dosa = await prisma.foodItem.create({
    data: {
      restaurantId: rest4.id,
      categoryId: cat4South.id,
      name: 'Benne Ghee Roast Masala Dosa',
      description: 'Crispy fermented rice crepe roasted in aromatic country butter (benne), stuffed with spiced potato mash, served with 3 chutneys and hot drumstick sambar.',
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
      restaurantId: rest4.id,
      categoryId: cat4South.id,
      name: 'Ghee Podi Idli Platter (4 Pcs)',
      description: 'Steamed rice cakes tossed in fiery spicy gunpowder podi masala and sizzling desi ghee with coconut chutney.',
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
      restaurantId: rest4.id,
      categoryId: cat4South.id,
      name: 'Crispy Medu Vada Sambar (2 Pcs)',
      description: 'Golden fried crispy black gram lentil doughnuts served with piping hot drumstick sambar and fresh ginger chutney.',
      price: 129.0,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
      isVegetarian: true,
      prepTimeMinutes: 8,
      calories: 310,
      displayOrder: 3,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest4.id,
      categoryId: cat4Healthy.id,
      name: 'Superfood Millet Khichdi Bowl',
      description: 'Foxtail millet and organic yellow moong dal slow-cooked with cumin, ginger, turmeric, and pure cow ghee.',
      price: 199.0,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
      isVegetarian: true,
      prepTimeMinutes: 12,
      calories: 360,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest4.id,
      categoryId: cat4Bev.id,
      name: 'Kumbakonam Degree Filter Coffee',
      description: 'Double shot fresh chicory decoction frothed with boiled farm milk served in traditional brass davarah-tumbler.',
      price: 79.0,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
      isVegetarian: true,
      prepTimeMinutes: 5,
      calories: 110,
      displayOrder: 1,
    },
  });

  // --- RESTAURANT 5: Wok & Spice ---
  const owner5 = await prisma.user.create({
    data: {
      email: 'owner5@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Chef Lin Chen (Wok & Spice)',
      phone: '+91 98888 55555',
      role: 'RESTAURANT_ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  const rest5 = await prisma.restaurant.create({
    data: {
      name: 'Wok & Spice',
      slug: 'wok-and-spice',
      description: 'Handmade steamed dim sums, fiery Hakka noodles, crispy golden spring rolls, and wok-tossed Schezwan delicacies.',
      phone: '+91 80 4666 2205',
      email: 'wok@zavora.com',
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
      cuisineTypes: 'Chinese, Asian, Dim Sum, Noodles, Snacks, Beverages',
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

  await prisma.restaurantStaff.create({
    data: { userId: owner5.id, restaurantId: rest5.id, role: 'OWNER' },
  });

  const driverUser5 = await prisma.user.create({
    data: {
      email: 'partner5@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Imran Khan (Dedicated Courier 5)',
      phone: '+91 95678 90125',
      role: 'DELIVERY_PARTNER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
  });

  const driverProfile5 = await prisma.deliveryPartnerProfile.create({
    data: {
      userId: driverUser5.id,
      restaurantId: rest5.id,
      vehicleType: 'BICYCLE',
      vehicleNumber: 'CY-BLR-ZV-505',
      licenseNumber: 'DL-2023-77105',
      isOnline: true,
      isAvailable: true,
      currentLatitude: 12.9705,
      currentLongitude: 77.5995,
      rating: 4.7,
      totalDeliveries: 62,
      totalEarnings: 2790.0,
    },
  });

  const cat5Chinese = await prisma.foodCategory.create({
    data: { restaurantId: rest5.id, name: 'Chinese', slug: 'chinese', displayOrder: 1 },
  });
  const cat5Snacks = await prisma.foodCategory.create({
    data: { restaurantId: rest5.id, name: 'Snacks', slug: 'snacks', displayOrder: 2 },
  });
  const cat5Bev = await prisma.foodCategory.create({
    data: { restaurantId: rest5.id, name: 'Beverages', slug: 'beverages', displayOrder: 3 },
  });

  const item5Noodles = await prisma.foodItem.create({
    data: {
      restaurantId: rest5.id,
      categoryId: cat5Chinese.id,
      name: 'Fiery Schezwan Chilli Garlic Noodles',
      description: 'Wok-tossed handmade wheat noodles with roasted red chillies, shredded bell peppers, spring onions, and spicy Schezwan sauce.',
      price: 249.0,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
      isVegetarian: true,
      isSpicy: true,
      isBestSeller: true,
      prepTimeMinutes: 15,
      calories: 580,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest5.id,
      categoryId: cat5Chinese.id,
      name: 'Steamed Crystal Dim Sum Platter (6 Pcs)',
      description: 'Translucent steamed dumplings filled with water chestnuts, shitake mushrooms, and bok choy with spicy chilli oil dip.',
      price: 279.0,
      discountPrice: 239.0,
      imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500',
      isVegetarian: true,
      prepTimeMinutes: 14,
      calories: 320,
      displayOrder: 2,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest5.id,
      categoryId: cat5Snacks.id,
      name: 'Crispy Veg Spring Rolls (6 Pcs)',
      description: 'Crisp golden rolls stuffed with glass noodles, carrots, and cabbage served with sweet spicy plum dip.',
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
      restaurantId: rest5.id,
      categoryId: cat5Bev.id,
      name: 'Iced Jasmine Honey Tea',
      description: 'Cold-brewed organic green jasmine blossom tea with raw honey and lemon peel.',
      price: 119.0,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500',
      isVegetarian: true,
      prepTimeMinutes: 5,
      calories: 90,
      displayOrder: 1,
    },
  });

  // --- RESTAURANT 6: Sweet Sip Cafe ---
  const owner6 = await prisma.user.create({
    data: {
      email: 'owner6@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Chef Chloe Dupont (Sweet Sip)',
      phone: '+91 98888 66666',
      role: 'RESTAURANT_ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const rest6 = await prisma.restaurant.create({
    data: {
      name: 'Sweet Sip Cafe',
      slug: 'sweet-sip-cafe',
      description: 'Belgian waffles, artisanal tiramisu, nutrient superfood bowls, cold-pressed elixirs, and fresh cafe bakeries.',
      phone: '+91 80 4777 1106',
      email: 'sweetsip@zavora.com',
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
      cuisineTypes: 'Desserts, Healthy Food, Beverages, Snacks, Bakery',
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

  await prisma.restaurantStaff.create({
    data: { userId: owner6.id, restaurantId: rest6.id, role: 'OWNER' },
  });

  const driverUser6 = await prisma.user.create({
    data: {
      email: 'partner6@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Deepak Joshi (Dedicated Courier 6)',
      phone: '+91 96789 01236',
      role: 'DELIVERY_PARTNER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const driverProfile6 = await prisma.deliveryPartnerProfile.create({
    data: {
      userId: driverUser6.id,
      restaurantId: rest6.id,
      vehicleType: 'SCOOTER',
      vehicleNumber: 'KA-01-ZV-6006',
      licenseNumber: 'DL-2022-88106',
      isOnline: true,
      isAvailable: true,
      currentLatitude: 12.9660,
      currentLongitude: 77.6110,
      rating: 4.8,
      totalDeliveries: 84,
      totalEarnings: 3780.0,
    },
  });

  const cat6Desserts = await prisma.foodCategory.create({
    data: { restaurantId: rest6.id, name: 'Desserts', slug: 'desserts', displayOrder: 1 },
  });
  const cat6Healthy = await prisma.foodCategory.create({
    data: { restaurantId: rest6.id, name: 'Healthy Food', slug: 'healthy-food', displayOrder: 2 },
  });
  const cat6Bev = await prisma.foodCategory.create({
    data: { restaurantId: rest6.id, name: 'Beverages', slug: 'beverages', displayOrder: 3 },
  });
  const cat6Snacks = await prisma.foodCategory.create({
    data: { restaurantId: rest6.id, name: 'Snacks', slug: 'snacks', displayOrder: 4 },
  });

  const item6Waffle = await prisma.foodItem.create({
    data: {
      restaurantId: rest6.id,
      categoryId: cat6Desserts.id,
      name: 'Belgian Chocolate Waffle with Nutella',
      description: 'Crispy warm Belgian malt waffle smothered in melted dark chocolate, roasted almond flakes, and vanilla bean cream.',
      price: 269.0,
      discountPrice: 229.0,
      imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 12,
      calories: 580,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest6.id,
      categoryId: cat6Healthy.id,
      name: 'Berry Acai Superfood Power Bowl',
      description: 'Organic Brazilian acai berry puree topped with chia seeds, toasted pumpkin seeds, fresh blueberries, and raw wildflower honey.',
      price: 349.0,
      imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500',
      isVegetarian: true,
      isVegan: true,
      isBestSeller: true,
      prepTimeMinutes: 10,
      calories: 380,
      displayOrder: 1,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest6.id,
      categoryId: cat6Desserts.id,
      name: 'Classic Venetian Tiramisu Jar',
      description: 'Espresso-soaked ladyfingers layered with whipped mascarpone cream and dusted with Dutch cocoa powder.',
      price: 249.0,
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500',
      isVegetarian: true,
      prepTimeMinutes: 8,
      calories: 460,
      displayOrder: 2,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest6.id,
      categoryId: cat6Bev.id,
      name: 'Passion Fruit Mango Fizz Cooler',
      description: 'Fresh tropical mango pulp, crushed passion fruit seeds, sparkling seltzer, and fresh garden mint.',
      price: 159.0,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500',
      isVegetarian: true,
      prepTimeMinutes: 5,
      calories: 140,
      displayOrder: 1,
    },
  });

  // ==========================================
  // SEED SAMPLE ORDERS & TIMELINES ACROSS RESTAURANTS
  // ==========================================

  // Order 1: Completed order for Restaurant 1 (Zavora Pizza House) with Delivery Partner 1
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ZV-1001',
      customerId: customer1.id,
      restaurantId: rest1.id,
      deliveryPartnerId: driverProfile1.id,
      addressId: customer1AddressHome.id,
      status: 'DELIVERED',
      subtotal: 588.0,
      taxAmount: 29.4,
      deliveryFee: 40.0,
      totalAmount: 657.4,
      paymentMethod: 'ONLINE_DEMO_PAY',
      paymentStatus: 'PAID',
      deliveryAddressSnapshot: JSON.stringify({
        label: 'Home',
        recipientName: 'Alex Johnson',
        phone: '+91 98765 43210',
        streetAddress: customer1AddressHome.streetAddress,
        city: customer1AddressHome.city,
      }),
      placedAt: new Date(Date.now() - 3600000),
      acceptedAt: new Date(Date.now() - 3300000),
      readyAt: new Date(Date.now() - 2400000),
      assignedAt: new Date(Date.now() - 2300000),
      pickedUpAt: new Date(Date.now() - 1800000),
      deliveredAt: new Date(Date.now() - 600000),
      items: {
        create: [
          { foodItemId: item1Margherita.id, name: 'Margherita Pizza', quantity: 1, unitPrice: 299.0, totalPrice: 299.0 },
          { foodItemId: item1Farmhouse.id, name: 'Farmhouse Pizza', quantity: 1, unitPrice: 429.0, totalPrice: 429.0 },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', notes: 'Order placed by customer' },
          { status: 'RESTAURANT_ACCEPTED', notes: 'Accepted by Zavora Pizza House kitchen' },
          { status: 'READY_FOR_PICKUP', notes: 'Food prepared and packed' },
          { status: 'DELIVERY_ASSIGNED', notes: 'Assigned to Dedicated Courier Arjun Kumar' },
          { status: 'PICKED_UP', notes: 'Courier collected order' },
          { status: 'DELIVERED', notes: 'Delivered at customer doorstep' },
        ],
      },
    },
  });

  await prisma.restaurantReview.create({
    data: {
      restaurantId: rest1.id,
      customerId: customer1.id,
      orderId: order1.id,
      rating: 5,
      comment: 'The wood-fired crust was unbelievable! Arrived piping hot in 20 minutes.',
      replyFromRestaurant: 'Thank you Alex! We bake every pizza fresh to order.',
    },
  });

  // Order 2: Active in-flight order for Restaurant 2 (Spice Route Biryani) with Delivery Partner 2
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ZV-1002',
      customerId: customer1.id,
      restaurantId: rest2.id,
      deliveryPartnerId: driverProfile2.id,
      addressId: customer1AddressHome.id,
      status: 'ON_THE_WAY',
      subtotal: 329.0,
      taxAmount: 16.45,
      deliveryFee: 40.0,
      totalAmount: 385.45,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      deliveryAddressSnapshot: JSON.stringify({
        label: 'Home',
        recipientName: 'Alex Johnson',
        phone: '+91 98765 43210',
        streetAddress: customer1AddressHome.streetAddress,
        city: customer1AddressHome.city,
      }),
      placedAt: new Date(Date.now() - 1500000),
      acceptedAt: new Date(Date.now() - 1200000),
      readyAt: new Date(Date.now() - 600000),
      assignedAt: new Date(Date.now() - 500000),
      pickedUpAt: new Date(Date.now() - 200000),
      items: {
        create: [
          { foodItemId: item2ChickenBiryani.id, name: 'Hyderabadi Chicken Biryani', quantity: 1, unitPrice: 329.0, totalPrice: 329.0 },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', notes: 'Order placed by customer' },
          { status: 'RESTAURANT_ACCEPTED', notes: 'Accepted by Spice Route Biryani kitchen' },
          { status: 'READY_FOR_PICKUP', notes: 'Food prepared and packed' },
          { status: 'DELIVERY_ASSIGNED', notes: 'Assigned to Dedicated Courier Kiran Reddy' },
          { status: 'PICKED_UP', notes: 'Courier collected order' },
          { status: 'ON_THE_WAY', notes: 'Courier is delivering your order' },
        ],
      },
    },
  });

  await prisma.deliveryAssignment.create({
    data: {
      orderId: order2.id,
      deliveryPartnerId: driverProfile2.id,
      status: 'ACCEPTED',
      distanceKm: 2.3,
      estimatedMinutes: 15,
    },
  });

  console.log('✅ ZAVORA database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Admin Account: admin@zavora.com / Password123!');
  console.log('Customer Account: customer@example.com / Password123!');
  console.log('6 Restaurants seeded:');
  console.log('  1. Zavora Pizza House     -> owner1@zavora.com | partner1@zavora.com');
  console.log('  2. Spice Route Biryani    -> owner2@zavora.com | partner2@zavora.com');
  console.log('  3. Burger District        -> owner3@zavora.com | partner3@zavora.com');
  console.log('  4. South Bowl Kitchen     -> owner4@zavora.com | partner4@zavora.com');
  console.log('  5. Wok & Spice            -> owner5@zavora.com | partner5@zavora.com');
  console.log('  6. Sweet Sip Cafe         -> owner6@zavora.com | partner6@zavora.com');
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
