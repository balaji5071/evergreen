import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/evergreen_restaurant";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,
  role: { type: String, enum: ["Customer", "Admin"], default: "Customer" },
  notificationEnabled: { type: Boolean, default: true },
}, { timestamps: true });

const MenuCategorySchema = new mongoose.Schema({
  name: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const MenuItemSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuCategory" },
  name: String,
  description: String,
  imageUrl: String,
  price: Number,
  available: { type: Boolean, default: true },
}, { timestamps: true });

const BannerSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const CouponSchema = new mongoose.Schema({
  code: { type: String, uppercase: true },
  discountType: { type: String, enum: ["percentage", "flat"], default: "flat" },
  discountValue: Number,
  discount: Number,
  minOrderAmount: Number,
  maxDiscountAmount: Number,
  description: String,
  terms: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const MenuCategory = mongoose.models.MenuCategory || mongoose.model("MenuCategory", MenuCategorySchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

async function seed() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Clear existing data
    await User.deleteMany({});
    await MenuCategory.deleteMany({});
    await MenuItem.deleteMany({});
    await Banner.deleteMany({});
    await Coupon.deleteMany({});

    // 1. Users (Read from environment variables)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@evergreen.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Evergreen Admin";
    const adminPhone = process.env.ADMIN_PHONE || "+91 9876543210";

    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const customerPasswordHash = await bcrypt.hash("customer123", 10);

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      passwordHash: adminPasswordHash,
      role: "Admin",
      notificationEnabled: true,
    });

    const customer = await User.create({
      name: "Eleanor Vance",
      email: "eleanor@example.com",
      phone: "+91 90900 10210",
      passwordHash: customerPasswordHash,
      role: "Customer",
      notificationEnabled: true,
    });

    console.log(`Created Admin account (${adminEmail}) & Customer account.`);

    // 2. Categories
    const catIndian = await MenuCategory.create({ name: "Indian", active: true });
    const catChinese = await MenuCategory.create({ name: "Chinese", active: true });
    const catContinental = await MenuCategory.create({ name: "Continental", active: true });
    const catBeverages = await MenuCategory.create({ name: "Beverages", active: true });

    console.log("Created Menu Categories.");

    // 3. Menu Items
    await MenuItem.create([
      {
        categoryId: catIndian._id,
        name: "Paneer Tikka Masala",
        description: "Cottage cheese cubes marinated in rich Indian spices, grilled and simmered in a velvety makhani gravy.",
        imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
        price: 320,
        available: true,
      },
      {
        categoryId: catIndian._id,
        name: "Paneer Butter Masala",
        description: "Soft paneer cubes cooked in a rich tomato, butter, and cashew cream gravy with authentic aroma.",
        imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
        price: 340,
        available: true,
      },
      {
        categoryId: catIndian._id,
        name: "Garlic Naan",
        description: "Traditional Indian flatbread brushed with garlic butter and fresh cilantro, baked in a clay tandoor.",
        imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
        price: 60,
        available: true,
      },
      {
        categoryId: catChinese._id,
        name: "Veg Chowmein",
        description: "Wok-tossed noodles with crisp colorful veggies, soy sauce, and aromatic stir-fry spices.",
        imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
        price: 180,
        available: true,
      },
      {
        categoryId: catChinese._id,
        name: "Chicken Hakka Noodles",
        description: "Classic street-style Hakka noodles tossed with tender chicken strips, scallions, and bell peppers.",
        imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
        price: 220,
        available: true,
      },
      {
        categoryId: catContinental._id,
        name: "Margherita Pizza",
        description: "Hand-crusted sourdough topped with San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves.",
        imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
        price: 280,
        available: true,
      },
      {
        categoryId: catContinental._id,
        name: "Heritage Grains Bowl",
        description: "Nutritious bowl filled with wild quinoa, roasted sweet potatoes, avocado, heirloom tomatoes, and lemon tahini dressing.",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
        price: 310,
        available: true,
      },
      {
        categoryId: catBeverages._id,
        name: "Matcha Latte",
        description: "Ceremonial grade Uji matcha whisked with steamed almond milk and organic agave nectar.",
        imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80",
        price: 140,
        available: true,
      },
    ]);

    console.log("Created Menu Items.");

    // 4. Banners
    await Banner.create([
      {
        title: "Namaste 🌿 Authentic flavors, local heart. Freshly prepared for you.",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        active: true,
      },
      {
        title: "Free Chai with any meal",
        imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80",
        active: true,
      },
    ]);

    // 5. Swiggy/Zomato style Coupons
    await Coupon.create([
      {
        code: "WELCOME50",
        discountType: "percentage",
        discountValue: 50,
        discount: 50,
        minOrderAmount: 199,
        maxDiscountAmount: 120,
        description: "50% OFF up to ₹120 on orders above ₹199",
        active: true,
      },
      {
        code: "TRYNEW",
        discountType: "percentage",
        discountValue: 60,
        discount: 60,
        minOrderAmount: 249,
        maxDiscountAmount: 150,
        description: "60% OFF up to ₹150 on orders above ₹249",
        active: true,
      },
      {
        code: "FLAT100",
        discountType: "flat",
        discountValue: 100,
        discount: 100,
        minOrderAmount: 399,
        maxDiscountAmount: 0,
        description: "Flat ₹100 OFF on orders above ₹399",
        active: true,
      },
      {
        code: "STEALDEAL",
        discountType: "percentage",
        discountValue: 40,
        discount: 40,
        minOrderAmount: 149,
        maxDiscountAmount: 80,
        description: "40% OFF up to ₹80 on orders above ₹149",
        active: true,
      },
    ]);

    console.log("Seeding finished successfully with Swiggy/Zomato coupons!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
