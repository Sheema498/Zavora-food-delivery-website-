import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ZAVORA single-restaurant database seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.restaurantReview.deleteMany({});
  await prisma.deliveryLocation.deleteMany({});
  await prisma.deliveryAssignment.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.foodItem.deleteMany({});
  await prisma.foodCategory.deleteMany({});
  await prisma.restaurantManager.deleteMany({});
  await prisma.deliveryBoy.deleteMany({});
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
        description: 'Flat ₹100 OFF on your first Zavora order above ₹299',
        discountType: 'FLAT',
        discountValue: 100,
        minOrderAmount: 299,
        validUntil,
        isActive: true,
      },
      {
        code: 'TASTY20',
        description: '20% OFF on all gourmet dishes up to ₹75',
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

  // Also seed legacy admin email as alias if needed
  await prisma.user.create({
    data: {
      email: 'admin@quickbite.com',
      passwordHash: commonPasswordHash,
      name: 'Super Admin Alias',
      phone: '+91 99001 00002',
      role: 'SUPER_ADMIN',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 4. THE SINGLE RESTAURANT: Zavora Restaurant
  const zavoraRestaurant = await prisma.restaurant.create({
    data: {
      name: 'Zavora Restaurant',
      slug: 'zavora-restaurant',
      description: 'Satisfy your hunger instantly with artisanal, fresh gourmet pizzas, sizzling burgers, fragrant biryanis, and royal curries.',
      phone: '+91 80 4123 9901',
      email: 'restaurant@zavora.com',
      logoUrl: '/zavora-logo.png',
      bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
      address: '88 Brigade Road, Ashok Nagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560025',
      latitude: 12.9725,
      longitude: 77.6075,
      isOpen: true,
      cuisineTypes: 'Pizza, Burgers, Biryani, South Indian, North Indian, Chinese, Snacks, Desserts, Beverages',
      priceRange: '$$',
      rating: 4.9,
      totalRatings: 520,
      avgPrepTimeMinutes: 20,
      deliveryFee: 40.0,
      minOrderAmount: 100.0,
      totalRevenue: 34850.0,
    },
  });

  // 5. THE ONE RESTAURANT MANAGER
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Chef Rajesh Sharma (Kitchen Head)',
      phone: '+91 98888 11001',
      role: 'RESTAURANT_MANAGER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    },
  });

  await prisma.restaurantManager.create({
    data: {
      userId: managerUser.id,
      restaurantId: zavoraRestaurant.id,
    },
  });

  // 6. THE ONE DELIVERY BOY
  const deliveryBoyUser = await prisma.user.create({
    data: {
      email: 'delivery@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Kiran Kumar (Zavora Dedicated Courier)',
      phone: '+91 97777 22001',
      role: 'DELIVERY_BOY',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const zavoraDeliveryBoy = await prisma.deliveryBoy.create({
    data: {
      userId: deliveryBoyUser.id,
      restaurantId: zavoraRestaurant.id,
      vehicleType: 'MOTORBIKE',
      vehicleNumber: 'KA-01-ZV-1001',
      licenseNumber: 'DL-KA-2024-0099881',
      isOnline: true,
      isAvailable: true,
      currentLatitude: 12.9725,
      currentLongitude: 77.6075,
      rating: 4.9,
      totalDeliveries: 142,
      totalEarnings: 6390.0,
    },
  });

  // 7. Customers & Delivery Addresses
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Alex Johnson',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      customerProfile: {
        create: {
          preferredLanguage: 'en',
          loyaltyPoints: 240,
          totalSpent: 3420.0,
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
      email: 'priya@zavora.com',
      passwordHash: commonPasswordHash,
      name: 'Priya Sharma',
      phone: '+91 98111 22233',
      role: 'CUSTOMER',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      customerProfile: {
        create: {
          preferredLanguage: 'en',
          loyaltyPoints: 120,
          totalSpent: 1650.0,
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
      streetAddress: 'Villa 14, Palm Meadows, Indiranagar',
      landmark: 'Near 100 Feet Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      isDefault: true,
    },
  });

  // 8. DATABASE-BACKED ZAVORA FOOD CATEGORIES
  const categoryDefs = [
    { name: 'Pizza', slug: 'pizza', displayOrder: 1 },
    { name: 'Burgers', slug: 'burgers', displayOrder: 2 },
    { name: 'Biryani', slug: 'biryani', displayOrder: 3 },
    { name: 'South Indian', slug: 'south-indian', displayOrder: 4 },
    { name: 'North Indian', slug: 'north-indian', displayOrder: 5 },
    { name: 'Chinese', slug: 'chinese', displayOrder: 6 },
    { name: 'Snacks', slug: 'snacks', displayOrder: 7 },
    { name: 'Desserts', slug: 'desserts', displayOrder: 8 },
    { name: 'Beverages', slug: 'beverages', displayOrder: 9 },
  ];

  const categories: Record<string, any> = {};
  for (const c of categoryDefs) {
    const created = await prisma.foodCategory.create({
      data: {
        restaurantId: zavoraRestaurant.id,
        name: c.name,
        slug: c.slug,
        displayOrder: c.displayOrder,
        isActive: true,
      },
    });
    categories[c.slug] = created;
  }

  // 9. DATABASE-BACKED ZAVORA FOOD ITEMS (Realistic, High Quality, Database-Driven)
  const foodItemDefs = [
    // --- PIZZA ---
    {
      cat: 'pizza',
      name: 'Artisanal Margherita Pizza',
      description: 'Hand-stretched sourdough crust, San Marzano tomato sauce, fresh buffalo mozzarella, aromatic sweet basil, extra virgin olive oil.',
      price: 320.0,
      discountPrice: 289.0,
      imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 18,
      calories: 780,
    },
    {
      cat: 'pizza',
      name: 'Truffle Wild Mushroom Pizza',
      description: 'Wood-fired sourdough with roasted shiitake and button mushrooms, white truffle oil, fior di latte, and shaved parmesan.',
      price: 420.0,
      discountPrice: 380.0,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 20,
      calories: 840,
    },
    {
      cat: 'pizza',
      name: 'Spicy Peri Peri Paneer Pizza',
      description: 'House-marinated charred paneer cubes, roasted red paprika, crunchy bell peppers, spicy peri peri drizzle, mozzarella.',
      price: 360.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500',
      isVegetarian: true,
      isSpicy: true,
      isBestSeller: true,
      prepTimeMinutes: 18,
      calories: 890,
    },
    {
      cat: 'pizza',
      name: 'Smokehouse BBQ Chicken Pizza',
      description: 'Hickory-smoked pulled chicken breast, caramelized onions, smoked gouda, tangy BBQ sauce glaze, fresh cilantro.',
      price: 440.0,
      discountPrice: 399.0,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
      isVegetarian: false,
      isBestSeller: true,
      prepTimeMinutes: 22,
      calories: 950,
    },

    // --- BURGERS ---
    {
      cat: 'burgers',
      name: 'Classic Zavora Smashed Cheeseburger',
      description: 'Two smashed patties grilled with crispy crust edges, double American cheddar, pickles, secret burger sauce on toasted brioche.',
      price: 240.0,
      discountPrice: 219.0,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      isVegetarian: false,
      isBestSeller: true,
      prepTimeMinutes: 15,
      calories: 680,
    },
    {
      cat: 'burgers',
      name: 'Crispy Zesty Paneer Burger',
      description: 'Golden spiced panko-crusted paneer block, crunchy lettuce, pickled red onions, mint chipotle mayo on toasted potato bun.',
      price: 210.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 14,
      calories: 610,
    },
    {
      cat: 'burgers',
      name: 'Grilled Chicken Jalapeno Burger',
      description: 'Herbed grilled chicken breast, spicy pickled jalapenos, melted Swiss cheese, smoky chipotle aioli, crispy lettuce.',
      price: 260.0,
      discountPrice: 235.0,
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500',
      isVegetarian: false,
      isSpicy: true,
      isBestSeller: true,
      prepTimeMinutes: 16,
      calories: 640,
    },
    {
      cat: 'burgers',
      name: 'Double Truffle Bacon Burger',
      description: 'Double grilled tender patties, crispy bacon rashers, truffle mushroom duxelles, aged cheddar, garlic herb butter.',
      price: 320.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500',
      isVegetarian: false,
      isBestSeller: false,
      prepTimeMinutes: 18,
      calories: 820,
    },

    // --- BIRYANI ---
    {
      cat: 'biryani',
      name: 'Royal Dum Chicken Biryani',
      description: 'Long-grain aged basmati rice layered with tender marinated chicken, saffron milk, fried onions (birista), served with salan and raita.',
      price: 340.0,
      discountPrice: 299.0,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
      isVegetarian: false,
      isBestSeller: true,
      prepTimeMinutes: 20,
      calories: 850,
    },
    {
      cat: 'biryani',
      name: 'Nizam Mutton Handi Biryani',
      description: 'Succulent baby goat meat slow-cooked on charcoal dum with royal whole spices, saffron kewra water, served in a sealed handi.',
      price: 460.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500',
      isVegetarian: false,
      isBestSeller: true,
      prepTimeMinutes: 25,
      calories: 920,
    },
    {
      cat: 'biryani',
      name: 'Lucknowi Subz Dum Biryani',
      description: 'Aromatic basmati rice layered with garden vegetables, paneer cubes, cashews, raisins, and delicate Awadhi fragrant herbs.',
      price: 280.0,
      discountPrice: 249.0,
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 18,
      calories: 680,
    },

    // --- SOUTH INDIAN ---
    {
      cat: 'south-indian',
      name: 'Ghee Roast Masala Dosa',
      description: 'Crispy golden crepe roasted generously with pure cow ghee, stuffed with spiced potato masala, served with 3 chutneys & sambar.',
      price: 140.0,
      discountPrice: 125.0,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 12,
      calories: 420,
    },
    {
      cat: 'south-indian',
      name: 'Steamed Button Idli Vada Platter',
      description: 'Pair of pillowy soft steamed rice idlis and crispy medu vada served with hot vegetable drumstick sambar and fresh coconut chutney.',
      price: 120.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 10,
      calories: 360,
    },
    {
      cat: 'south-indian',
      name: 'Mysore Rava Onion Dosa',
      description: 'Crisp semolina crepe seasoned with green chillies, ginger, cracked black pepper, and generous topping of roasted onions.',
      price: 160.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 14,
      calories: 440,
    },

    // --- NORTH INDIAN ---
    {
      cat: 'north-indian',
      name: 'Butter Chicken Royale',
      description: 'Charcoal-grilled boneless tandoori chicken simmered in rich creamy tomato, cashew nut gravy, flavored with kasoori methi.',
      price: 360.0,
      discountPrice: 329.0,
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
      isVegetarian: false,
      isBestSeller: true,
      prepTimeMinutes: 18,
      calories: 720,
    },
    {
      cat: 'north-indian',
      name: 'Paneer Butter Masala',
      description: 'Fresh cottage cheese cubes folded in a silky, sweet & savoury spiced makhani gravy enriched with fresh dairy butter.',
      price: 310.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 16,
      calories: 640,
    },
    {
      cat: 'north-indian',
      name: 'Dal Makhani Slow-Simmered',
      description: 'Whole black lentils and kidney beans slow-cooked overnight with churned butter and cream for authentic velvety richness.',
      price: 260.0,
      discountPrice: 229.0,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 15,
      calories: 520,
    },
    {
      cat: 'north-indian',
      name: 'Garlic Butter Naan (2 pcs)',
      description: 'Soft tandoori leavened flatbread brushed with roasted minced garlic, melted butter, and fresh coriander leaves.',
      price: 90.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 8,
      calories: 310,
    },

    // --- CHINESE ---
    {
      cat: 'chinese',
      name: 'Hakka Chilli Garlic Noodles',
      description: 'Wok-tossed egg noodles with shredded seasonal vegetables, burnt garlic bits, scallions, and dark soy chilli glaze.',
      price: 220.0,
      discountPrice: 199.0,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
      isVegetarian: true,
      isSpicy: true,
      isBestSeller: true,
      prepTimeMinutes: 14,
      calories: 540,
    },
    {
      cat: 'chinese',
      name: 'Steamed Chicken Dim Sums (6 pcs)',
      description: 'Delicate translucent wheat wrappers packed with juicy minced chicken and scallions, served with spicy Sichuan dip.',
      price: 260.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500',
      isVegetarian: false,
      isBestSeller: true,
      prepTimeMinutes: 15,
      calories: 380,
    },
    {
      cat: 'chinese',
      name: 'Crispy Honey Chilli Paneer',
      description: 'Battered crispy cottage cheese fingers tossed with sesame seeds, honey, hot chilli paste, and crunchy bell peppers.',
      price: 240.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 14,
      calories: 590,
    },

    // --- SNACKS ---
    {
      cat: 'snacks',
      name: 'Loaded Cheese Peri Peri Fries',
      description: 'Golden crispy potato skin-on fries tossed in house peri-peri spice dust and smothered in warm jalapeno cheese sauce.',
      price: 160.0,
      discountPrice: 139.0,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 10,
      calories: 480,
    },
    {
      cat: 'snacks',
      name: 'Chicken Popcorn Bites',
      description: 'Tender bite-sized chicken pieces coated in seasoned buttermilk batter, fried extra crunchy, served with garlic mayo dip.',
      price: 190.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500',
      isVegetarian: false,
      isBestSeller: true,
      prepTimeMinutes: 12,
      calories: 450,
    },

    // --- DESSERTS ---
    {
      cat: 'desserts',
      name: 'Warm Chocolate Lava Cake',
      description: 'Decadent dark chocolate molten sponge cake with an oozing liquid ganache core, dusted with powdered sugar.',
      price: 180.0,
      discountPrice: 159.0,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 12,
      calories: 490,
    },
    {
      cat: 'desserts',
      name: 'Royal Saffron Gulab Jamun (2 pcs)',
      description: 'Soft melt-in-mouth milk solids dumplings soaked in warm rosewater and saffron sugar syrup, garnished with pistachios.',
      price: 120.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 8,
      calories: 380,
    },

    // --- BEVERAGES ---
    {
      cat: 'beverages',
      name: 'Cold Brew Iced Latte',
      description: '18-hour steep single-origin Arabica cold brew concentrate blended with chilled whole milk and mild Madagascar vanilla.',
      price: 140.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 5,
      calories: 140,
    },
    {
      cat: 'beverages',
      name: 'Fresh Alphonso Mango Shake',
      description: 'Thick creamy milkshake whipped with ripe Ratnagiri Alphonso mango pulp, condensed milk, and vanilla ice cream scoop.',
      price: 150.0,
      discountPrice: 129.0,
      imageUrl: 'https://images.unsplash.com/photo-1570696516188-ade861b84a49?w=500',
      isVegetarian: true,
      isBestSeller: true,
      prepTimeMinutes: 6,
      calories: 280,
    },
    {
      cat: 'beverages',
      name: 'Virgin Mint Mojito Cooler',
      description: 'Refreshing crushed garden mint leaves, muddled Persian limes, cane sugar syrup, topped with sparkling club soda.',
      price: 130.0,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500',
      isVegetarian: true,
      isBestSeller: false,
      prepTimeMinutes: 5,
      calories: 110,
    },
  ];

  const createdFoodItems: any[] = [];
  let orderIdx = 1;
  for (const item of foodItemDefs) {
    const category = categories[item.cat];
    const created = await prisma.foodItem.create({
      data: {
        restaurantId: zavoraRestaurant.id,
        categoryId: category.id,
        name: item.name,
        description: item.description,
        price: item.price,
        discountPrice: item.discountPrice,
        imageUrl: item.imageUrl,
        isAvailable: true,
        isVegetarian: item.isVegetarian,
        isSpicy: item.isSpicy || false,
        isBestSeller: item.isBestSeller,
        prepTimeMinutes: item.prepTimeMinutes,
        calories: item.calories,
        displayOrder: orderIdx++,
      },
    });
    createdFoodItems.push(created);
  }

  console.log(`✅ Created ${createdFoodItems.length} database-backed food items across 9 categories.`);

  // 10. REAL HISTORICAL ORDERS FOR DATABASE ANALYTICS
  // Create 6 realistic delivered orders spread over past days so Super Admin analytics calculate genuine figures
  const now = new Date();
  const sampleOrdersData = [
    {
      orderNumber: 'ZV-1001',
      customer: customer1,
      items: [createdFoodItems[0], createdFoodItems[4]], // Margherita + Smashed Burger
      status: 'DELIVERED',
      paymentMethod: 'ONLINE_DEMO_PAY',
      paymentStatus: 'PAID',
      placedMinutesAgo: 180,
    },
    {
      orderNumber: 'ZV-1002',
      customer: customer2,
      items: [createdFoodItems[8], createdFoodItems[23]], // Chicken Biryani + Mango Shake
      status: 'DELIVERED',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PAID',
      placedMinutesAgo: 120,
    },
    {
      orderNumber: 'ZV-1003',
      customer: customer1,
      items: [createdFoodItems[13], createdFoodItems[16]], // Butter Chicken + Garlic Naan
      status: 'DELIVERED',
      paymentMethod: 'ONLINE_DEMO_PAY',
      paymentStatus: 'PAID',
      placedMinutesAgo: 60,
    },
    {
      orderNumber: 'ZV-1004',
      customer: customer2,
      items: [createdFoodItems[2], createdFoodItems[20]], // Peri Peri Paneer Pizza + Cheese Fries
      status: 'DELIVERED',
      paymentMethod: 'ONLINE_DEMO_PAY',
      paymentStatus: 'PAID',
      placedMinutesAgo: 45,
    },
  ];

  for (const sod of sampleOrdersData) {
    const placedAt = new Date(now.getTime() - sod.placedMinutesAgo * 60000);
    const deliveredAt = new Date(placedAt.getTime() + 35 * 60000);

    const subtotal = sod.items.reduce((sum: number, it: any) => sum + (it.discountPrice || it.price), 0);
    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const deliveryFee = 40.0;
    const totalAmount = Math.round((subtotal + taxAmount + deliveryFee) * 100) / 100;

    const ord = await prisma.order.create({
      data: {
        orderNumber: sod.orderNumber,
        customerId: sod.customer.id,
        restaurantId: zavoraRestaurant.id,
        deliveryBoyId: zavoraDeliveryBoy.id,
        status: sod.status,
        subtotal,
        taxAmount,
        deliveryFee,
        totalAmount,
        paymentMethod: sod.paymentMethod,
        paymentStatus: sod.paymentStatus,
        deliveryAddressSnapshot: JSON.stringify({
          label: 'Home',
          recipientName: sod.customer.name,
          phone: sod.customer.phone,
          streetAddress: 'Apartment 402, Prestige Towers, Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560025',
          latitude: 12.9698,
          longitude: 77.6033,
        }),
        placedAt,
        acceptedAt: new Date(placedAt.getTime() + 3 * 60000),
        readyAt: new Date(placedAt.getTime() + 18 * 60000),
        assignedAt: new Date(placedAt.getTime() + 19 * 60000),
        pickedUpAt: new Date(placedAt.getTime() + 25 * 60000),
        deliveredAt,
        createdAt: placedAt,
        updatedAt: deliveredAt,
        items: {
          create: sod.items.map((it: any) => ({
            foodItemId: it.id,
            name: it.name,
            quantity: 1,
            unitPrice: it.discountPrice || it.price,
            totalPrice: it.discountPrice || it.price,
          })),
        },
        statusHistory: {
          createMany: {
            data: [
              { status: 'PENDING', notes: 'Order placed by customer', createdAt: placedAt },
              { status: 'RESTAURANT_ACCEPTED', notes: 'Manager accepted order', createdAt: new Date(placedAt.getTime() + 3 * 60000) },
              { status: 'PREPARING', notes: 'Kitchen began cooking', createdAt: new Date(placedAt.getTime() + 5 * 60000) },
              { status: 'READY_FOR_PICKUP', notes: 'Order packed and ready', createdAt: new Date(placedAt.getTime() + 18 * 60000) },
              { status: 'DELIVERY_ASSIGNED', notes: 'Assigned to Kiran Kumar', createdAt: new Date(placedAt.getTime() + 19 * 60000) },
              { status: 'DELIVERY_ACCEPTED', notes: 'Kiran accepted delivery', createdAt: new Date(placedAt.getTime() + 20 * 60000) },
              { status: 'ARRIVED_AT_RESTAURANT', notes: 'Kiran reached Zavora', createdAt: new Date(placedAt.getTime() + 23 * 60000) },
              { status: 'PICKED_UP', notes: 'Food picked up', createdAt: new Date(placedAt.getTime() + 25 * 60000) },
              { status: 'ON_THE_WAY', notes: 'Out for delivery', createdAt: new Date(placedAt.getTime() + 26 * 60000) },
              { status: 'DELIVERED', notes: 'Delivered to customer doorstep', createdAt: deliveredAt },
            ],
          },
        },
        payments: {
          create: {
            userId: sod.customer.id,
            amount: totalAmount,
            method: sod.paymentMethod,
            status: sod.paymentStatus,
            transactionRef: `TXN-${sod.orderNumber}`,
          },
        },
      },
    });
  }

  console.log('✅ Seeded real historical delivered orders for accurate database analytics.');
  console.log('🎉 Zavora single-restaurant seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
