const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://balajich058_db_user:M9iCmu957YXCmGdH@evergreen.depbnf8.mongodb.net/";

const CategorySchema = new mongoose.Schema(
  { name: { type: String, required: true }, active: { type: Boolean, default: true } },
  { timestamps: true }
);

const MenuItemSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuCategory", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MenuCategory = mongoose.models.MenuCategory || mongoose.model("MenuCategory", CategorySchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);

const MENU_DATA = [
  // CARD 1
  {
    category: "Nachos",
    imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500",
    items: [
      { name: "Peri Peri Nachos", price: 70, description: "Crispy corn nachos dusted with spicy peri peri seasoning" },
      { name: "Loaded Nachos", price: 100, description: "Loaded with veggies, salsa, and melted cheese dip" },
      { name: "Cheezy Loaded Nachos", price: 110, description: "Extra loaded cheese sauce with jalapeños and seasonings" },
    ],
  },
  {
    category: "Pasta",
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500",
    items: [
      { name: "Bombay Masala Pasta", price: 110, description: "Fusion pasta tossed in spicy Indian Mumbai style masala" },
      { name: "Peri Peri Pasta", price: 120, description: "Fiery peri peri sauce pasta with bell peppers" },
      { name: "Red Pasta", price: 130, description: "Classic Italian arrabbiata tomato basil sauce pasta" },
      { name: "Mix Pasta", price: 140, description: "Pink sauce creamy & tangy combination pasta" },
      { name: "White Sauce Pasta", price: 170, description: "Rich creamy alfredo sauce pasta with herbs & garlic" },
    ],
  },
  {
    category: "Sandwich",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500",
    items: [
      { name: "Bombay Masala", price: 80, description: "Classic spicy potato masala grilled sandwich" },
      { name: "Veg Mayo Grilled", price: 90, description: "Fresh diced veggies in creamy mayonnaise spread" },
      { name: "Corn Cheese", price: 100, description: "Sweet corn kernels packed with melted mozzarella" },
      { name: "Veg Cheese", price: 100, description: "Garden fresh veggies topped with melted cheese slices" },
      { name: "Chocolate Sandwich", price: 100, description: "Sweet dark chocolate melted inside toasted bread" },
      { name: "Peri Peri Potato", price: 120, description: "Spiced potato patty with peri peri spread" },
      { name: "Cheese Burst", price: 120, description: "Double layered melted liquid cheese filling" },
      { name: "Cheese Chilli", price: 120, description: "Spicy green chillies and molten cheese toast" },
      { name: "Tandoori Potato", price: 120, description: "Tandoori mayo spiced potato slices grilled" },
      { name: "Chocolate Cheese", price: 130, description: "Unique mix of melted chocolate and cheese" },
      { name: "Mexican Paneer", price: 140, description: "Mexican spiced cottage cheese cubes & salsa" },
      { name: "Paneer Tandoori", price: 140, description: "Grilled paneer marinated in smoky tandoori sauce" },
      { name: "Pizza Sandwich", price: 150, description: "Pizza sauce, veggies, oregano & cheese grilled" },
      { name: "Club Sandwich", price: 170, description: "Triple decker sandwich loaded with paneer & veggies" },
    ],
  },
  {
    category: "Spring Roll",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
    items: [
      { name: "Veg Spring Roll", price: 140, description: "Crispy fried rolls stuffed with seasoned shredded veggies" },
      { name: "Veg Manchurian Roll", price: 160, description: "Stuffed with vegetable manchurian balls & Indo-Chinese sauce" },
      { name: "Mushroom Roll", price: 170, description: "Sautéed mushrooms and onions rolled in crispy sheets" },
      { name: "Paneer Roll", price: 180, description: "Spicy paneer cubes wrapped in golden fried rolls" },
    ],
  },
  {
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    items: [
      { name: "Veg Cheese Burger", price: 50, description: "Crispy veg patty with cheese slice & burger sauce" },
      { name: "Aloo Tikki", price: 60, description: "Classic crispy potato patty burger with mayo & onions" },
      { name: "Aloo Tikki Masala", price: 70, description: "Spiced aloo tikki with fiery desi masala sauce" },
      { name: "Mexican Burger", price: 70, description: "Jalapeño, salsa, and crisp veg patty" },
      { name: "Mexican Masala", price: 70, description: "Tangy Mexican herb spiced veggie burger" },
      { name: "Paneer Patty", price: 100, description: "Golden fried thick paneer patty with lettuce & mayo" },
    ],
  },
  {
    category: "Fries",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500",
    items: [
      { name: "French Fries", price: 110, description: "Classic salted crispy golden potato french fries" },
      { name: "Peri Peri Fries", price: 130, description: "Fries tossed in spicy African peri peri seasoning" },
      { name: "Masala Fries", price: 140, description: "Chatpata Indian spiced crispy potato fries" },
      { name: "Cheese Loaded Fries", price: 150, description: "Crispy fries smothered in hot liquid cheese sauce" },
    ],
  },
  {
    category: "Maggi",
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500",
    items: [
      { name: "Regular Maggi", price: 50, description: "Classic comforting masala Maggi noodles" },
      { name: "Corn Maggi", price: 70, description: "Maggi cooked with juicy sweet corn" },
      { name: "Schezwan Maggi", price: 80, description: "Spicy & tangy Schezwan sauce infused Maggi" },
      { name: "Veg Maggi", price: 80, description: "Loaded with peas, carrots, onions & tomatoes" },
      { name: "Chilli Garlic Maggi", price: 80, description: "Garlicky spicy chilli Maggi noodles" },
      { name: "Cheese Maggi", price: 80, description: "Topped with melted cheese slice & herbs" },
      { name: "Cheese Corn Maggi", price: 90, description: "Creamy cheesy Maggi with sweet corn" },
      { name: "Tadka Maggi", price: 100, description: "Desi butter ghee garlic tadka infused Maggi" },
      { name: "Paneer Maggi", price: 100, description: "Soft paneer cubes tossed in Maggi masala" },
      { name: "Veg Cheese Maggi", price: 100, description: "Double veggies and melted cheese Maggi" },
    ],
  },
  {
    category: "Combo Meal",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    items: [
      { name: "Single Combo", price: 210, description: "Choice of Manchurian or Fries + Noodles + Virgin Mojito" },
      { name: "Rice Combo", price: 230, description: "Paneer Chilli or Veg Fried Rice + Virgin Mojito" },
      { name: "Dual Combo", price: 310, description: "Fries + Veg Fried Rice + 2 Virgin Mojitos" },
      { name: "Triple Combo", price: 490, description: "Fries + Paneer Chilli / Manchurian + Veg Fried Rice + 3 Mojitos" },
    ],
  },
  {
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
    items: [
      { name: "Margerita Pizza", price: 150, description: "Classic mozzarella cheese and fresh basil sauce pizza" },
      { name: "Onion & Capsicum", price: 150, description: "Crunchy red onions and green capsicum toppings" },
      { name: "Peri Peri", price: 150, description: "Peri peri spiced veggies and mozzarella" },
      { name: "Tomato & Onion", price: 150, description: "Fresh sliced juicy tomatoes and onions" },
      { name: "Cheese Corn", price: 160, description: "Golden sweet corn kernels on cheesy base" },
      { name: "Cheese Chilli", price: 160, description: "Green chilli peppers and extra cheese" },
      { name: "Roasted Garlic & Corn", price: 180, description: "Smoky garlic cloves and sweet corn" },
      { name: "Peppy Paneer", price: 180, description: "Paneer cubes, red paprika & capsicum" },
      { name: "Veg Paradise", price: 200, description: "Loaded with corn, capsicum, tomato, onion & olives" },
      { name: "Bombay Paneer", price: 220, description: "Spiced Mumbai style marinated paneer pizza" },
      { name: "Cheese Burst", price: 230, description: "Crust filled with overflowing molten cheese" },
      { name: "Mexican Style", price: 270, description: "Jalapeños, corn, beans, salsa & Mexican herbs" },
      { name: "Farmhouse", price: 270, description: "Mushroom, corn, capsicum, onion & tomato" },
      { name: "Double Cheeze", price: 280, description: "Extra heavy double layer mozzarella topping" },
    ],
  },
  {
    category: "Shakes",
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500",
    items: [
      { name: "Cold Coffee", price: 100, description: "Thick blended iced coffee shake" },
      { name: "Cold Coffee with Icecream", price: 110, description: "Classic cold coffee topped with vanilla scoop" },
      { name: "Choclate Shake", price: 120, description: "Rich Belgian chocolate milk shake" },
      { name: "Butter Scotch", price: 130, description: "Crunchy butterscotch nut milk shake" },
      { name: "Oreo Shake", price: 130, description: "Blended Oreo cookies with chocolate drizzle" },
      { name: "Pulpy Orange", price: 130, description: "Refreshing citrus pulp shake" },
      { name: "Kitkat Shake", price: 130, description: "Crunchy KitKat bar chocolate shake" },
      { name: "Green Apple", price: 140, description: "Tangy green apple thick drink shake" },
      { name: "Strawberry Shake", price: 140, description: "Sweet strawberry fruity milkshake" },
      { name: "Black Current", price: 150, description: "Exotic blackcurrantberry milk shake" },
      { name: "Kesar Badam", price: 150, description: "Rich saffron almond milk beverage" },
      { name: "Blue Berry Shake", price: 170, description: "Premium blueberry fruit shake" },
    ],
  },
  {
    category: "Mocktails",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500",
    items: [
      { name: "Fresh Lime Soda", price: 50, description: "Zesty lemon soda (Sweet or Salted)" },
      { name: "Masala Coldrink", price: 50, description: "Chilled cola with chatpata Indian spices" },
      { name: "Blue Lagoon", price: 70, description: "Curacao blue citrus refresher soda" },
      { name: "Orange Mojito", price: 80, description: "Citrus orange mint and lime refresher" },
      { name: "Virgin Mojito", price: 80, description: "Classic fresh mint leaves, lime & soda" },
      { name: "Green Apple", price: 90, description: "Crisp green apple soda mocktail" },
      { name: "Watermelon", price: 100, description: "Sweet fresh watermelon cooler" },
      { name: "Mango", price: 100, description: "Tropical mango pulp mocktail" },
      { name: "Blueberry", price: 110, description: "Chilled wild blueberry soda" },
      { name: "Strawberry", price: 110, description: "Fruity strawberry soda cooler" },
      { name: "Black Current", price: 110, description: "Tangy blackcurrant soda mocktail" },
      { name: "Green Serene", price: 110, description: "Cool cucumber mint green refresher" },
    ],
  },
  {
    category: "Hot Beverage",
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500",
    items: [
      { name: "Black Tea", price: 15, description: "Strong brewed aromatic hot black tea" },
      { name: "Milk Tea", price: 20, description: "Desi masala milk tea chai" },
      { name: "Lemon Tea", price: 20, description: "Zesty hot lemon infused tea" },
      { name: "Black Coffee", price: 25, description: "Freshly brewed hot black coffee" },
      { name: "Milk Coffee", price: 40, description: "Creamy hot filter style coffee" },
      { name: "Chocolate Coffee", price: 50, description: "Hot coffee blended with rich cocoa" },
      { name: "Hot Coco", price: 90, description: "Thick hot chocolate cocoa beverage" },
    ],
  },

  // CARD 2
  {
    category: "Salad",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    items: [
      { name: "Onion Salad", price: 40, description: "Fresh sliced ring onions with chat masala & lemon" },
      { name: "Green Salad", price: 50, description: "Cucumber, tomato, carrot & onion salad platter" },
      { name: "Chilli Salad", price: 60, description: "Spiced green chillies and cucumber salad" },
    ],
  },
  {
    category: "Papad",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
    items: [
      { name: "Dry Papad", price: 20, description: "Roasted crunchy lentil papad" },
      { name: "Fry Papad", price: 30, description: "Deep fried crispy papad" },
      { name: "Butter Papad", price: 35, description: "Roasted papad brushed with fresh butter" },
      { name: "Masala Papad", price: 40, description: "Fried papad topped with spicy onion tomato chat" },
      { name: "Papad Churi", price: 100, description: "Crushed papad mixed with ghee, spices & coriander" },
    ],
  },
  {
    category: "65 Ki Pasand",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500",
    items: [
      { name: "Aloo 65", price: 120, description: "Crispy potato cubes tossed in South Indian 65 masala" },
      { name: "Gobhi 65", price: 130, description: "Fried cauliflower florets in 65 spicy tadka" },
      { name: "Baby Corn 65", price: 150, description: "Golden fried baby corn in curry leaf 65 spice" },
      { name: "Mushroom 65", price: 150, description: "Button mushrooms tossed in fiery 65 paste" },
      { name: "Paneer 65", price: 170, description: "Cottage cheese cubes tossed in spicy yogurt 65 sauce" },
    ],
  },
  {
    category: "Soup",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500",
    items: [
      { name: "Tomato Soup", price: 80, description: "Rich creamy tomato soup served with crispy croutons" },
      { name: "Veg Hot & Sour Soup", price: 90, description: "Spicy & sour Indo-Chinese vegetable soup" },
      { name: "Sweet Corn Soup", price: 100, description: "Comforting mild sweet corn veg broth" },
      { name: "Manchow Soup", price: 100, description: "Spicy garlic vegetable soup topped with fried noodles" },
      { name: "Veg Mushroom Soup", price: 120, description: "Creamy mushroom broth with herbs" },
      { name: "Veg Corn Soup", price: 130, description: "Loaded veggie and corn cream soup" },
    ],
  },
  {
    category: "Biryani",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
    items: [
      { name: "Veg Biryani", price: 180, description: "Aromatic dum cooked basmati rice with mixed veggies" },
      { name: "Veg Handi Biryani", price: 190, description: "Handi cooked traditional biryani with rich spices" },
      { name: "Veg Hydrabadi Biryani", price: 220, description: "Spicy Hyderabadi style layered veg biryani" },
      { name: "Veg Kaju Biryani", price: 260, description: "Royal biryani topped with roasted cashew nuts" },
      { name: "Evergreen Spl. Biryani", price: 270, description: "Chef special signature dum biryani loaded with paneer & dry fruits" },
    ],
  },
  {
    category: "Fried Rice",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
    items: [
      { name: "Veg Fried Rice", price: 120, description: "Wok tossed basmati rice with finely chopped veggies" },
      { name: "Schezwan Fried Rice", price: 130, description: "Spicy Schezwan pepper sauce fried rice" },
      { name: "Mix Rice", price: 140, description: "Combination veg fried rice with exotic veggies" },
      { name: "Butter Chilli Rice", price: 140, description: "Buttery wok rice with green chillies & garlic" },
      { name: "Masala Rice", price: 140, description: "Desi style spiced fried rice" },
      { name: "Paneer Fried Rice", price: 150, description: "Fried rice loaded with soft paneer cubes" },
      { name: "Mushroom Fried Rice", price: 150, description: "Sautéed mushrooms tossed in wok rice" },
      { name: "Kaju Fried Rice", price: 160, description: "Golden fried cashew nuts tossed in basmati rice" },
      { name: "Manchurian Rice", price: 150, description: "Fried rice mixed with veg manchurian sauce" },
      { name: "Paneer Chilli Rice", price: 200, description: "Paneer chilli gravy served over fried rice" },
      { name: "Mushroom Chilli Rice", price: 210, description: "Mushroom chilli wok rice bowl" },
      { name: "Gobhi 65 Rice", price: 200, description: "Crispy Gobhi 65 served over fried rice" },
      { name: "Baby Corn 65 Rice", price: 220, description: "Baby corn 65 spiced rice bowl" },
      { name: "Evergreen Special Rice", price: 230, description: "Special fried rice with paneer, kaju & dry fruits" },
    ],
  },
  {
    category: "Roti & Paratha",
    imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500",
    items: [
      { name: "Tawa Roti", price: 15, description: "Fresh whole wheat tawa flatbread" },
      { name: "Butter Roti", price: 20, description: "Tawa roti brushed with fresh Amul butter" },
      { name: "Pudina Roti", price: 25, description: "Whole wheat roti with dried mint leaves" },
      { name: "Paratha", price: 30, description: "Layered crispy tawa paratha" },
      { name: "Lachha Paratha", price: 40, description: "Multi-layered flaky wheat paratha" },
      { name: "Aloo Paratha", price: 70, description: "Stuffed potato & herbs paratha" },
      { name: "Masala Mix Paratha", price: 90, description: "Stuffed mixed veggie & spices paratha" },
      { name: "Paneer Paratha", price: 100, description: "Spiced paneer stuffed wheat paratha" },
      { name: "Aloo Cheese Paratha", price: 120, description: "Aloo & melted cheese stuffed paratha" },
      { name: "Paneer Cheese Paratha", price: 130, description: "Rich paneer and mozzarella cheese paratha" },
    ],
  },
  {
    category: "Thali",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
    items: [
      { name: "Veg Thali", price: 170, description: "Complete meal: 3 Roti, 1 Sabji, Rice, Dal, Papad" },
      { name: "Maharaja Thali", price: 230, description: "Grand meal: 4 Roti, 2 Sabji, Raita, Rice, Dal, Papad, Gulab Jamun & Rasgulla" },
    ],
  },
  {
    category: "Snacks",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500",
    items: [
      { name: "Onion Pakoda", price: 100, description: "Crispy onion fritters served with green chutney" },
      { name: "Chinese Bhel", price: 100, description: "Crispy fried noodles tossed in spicy tangy sauce" },
      { name: "Corn Fry", price: 120, description: "Crispy fried sweet corn with chat masala" },
      { name: "Chole Bhature", price: 130, description: "Spicy chickpea curry served with 2 fluffy bhaturas" },
      { name: "Chana Roast", price: 130, description: "Dry roasted spicy kabuli chana" },
      { name: "Chana Chilli", price: 140, description: "Crispy chana tossed in Indo-Chinese chilli garlic sauce" },
      { name: "Veg Manchurian", price: 150, description: "Deep fried veg balls in savory soy garlic sauce" },
      { name: "Veg Bullet", price: 150, description: "Spicy vegetable croquettes fried golden" },
      { name: "Gobhi Manchurian", price: 160, description: "Crispy cauliflower in manchurian gravy/dry" },
      { name: "Baby Corn Manchurian", price: 160, description: "Crispy baby corn in manchurian sauce" },
      { name: "Honey Chilli Potato", price: 160, description: "Crispy potato fingers in honey chilli glaze" },
      { name: "Veg Crispy", price: 160, description: "Battered crispy fried exotic veggies" },
      { name: "Paneer Pakoda", price: 170, description: "Cottage cheese pakoras with green chutney" },
      { name: "Hara Bhara Kabab", price: 170, description: "Spinach & green pea patties fried golden" },
      { name: "Veg Crunchy", price: 170, description: "Extra crunchy spiced vegetable bites" },
      { name: "Chilli Baby Corn", price: 170, description: "Crispy baby corn in spicy green chilli sauce" },
      { name: "Mushroom Manchurian", price: 170, description: "Sautéed mushrooms in manchurian sauce" },
      { name: "Mushroom Chilli", price: 170, description: "Mushroom tossed with bell peppers & chilli sauce" },
      { name: "Corn Chilli", price: 170, description: "Crispy sweet corn in chilli garlic paste" },
      { name: "Baby Corn Magestick", price: 170, description: "Crispy baby corn sticks with herbs" },
      { name: "Paneer Magestick", price: 170, description: "Chef special paneer finger sticks" },
      { name: "Corn Crispy", price: 180, description: "Double fried crunchy pepper sweet corn" },
      { name: "Paneer Manchurian", price: 180, description: "Paneer cubes in rich manchurian sauce" },
      { name: "Chilli Paneer", price: 190, description: "Paneer cubes tossed with capsicum, onion & green chilli" },
    ],
  },
  {
    category: "Noodles",
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500",
    items: [
      { name: "Chowmein", price: 150, description: "Street style wok tossed veg chowmein noodles" },
      { name: "Veg Noodles", price: 160, description: "Classic stir fried vegetable noodles" },
      { name: "Hakka Noodles", price: 160, description: "Indo-Chinese Hakka style soft noodles" },
      { name: "Chilli Garlic Noodles", price: 170, description: "Spicy chilli and fried garlic wok noodles" },
      { name: "Schezwan Noodles", price: 170, description: "Hot Schezwan sauce vegetable noodles" },
      { name: "Manchurian Noodles", price: 180, description: "Noodles tossed with vegetable manchurian balls" },
    ],
  },
  {
    category: "Dal",
    imageUrl: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=500",
    items: [
      { name: "Dal Lapeta", price: 130, description: "Thick flavorful spicy yellow lentil curry" },
      { name: "Jeera Fry", price: 120, description: "Tempered yellow dal with cumin seeds" },
      { name: "Dal Fry", price: 130, description: "Classic yellow lentils tempered with onions & tomatoes" },
      { name: "Dal Butter Fry", price: 150, description: "Rich butter tempered yellow dal fry" },
      { name: "Dal Tadka", price: 150, description: "Yellow dal topped with garlic ghee double tadka" },
    ],
  },
  {
    category: "Rice",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
    items: [
      { name: "Steam Rice", price: 70, description: "Fluffy steamed long grain basmati rice" },
      { name: "Jeera Rice", price: 80, description: "Basmati rice tempered with cumin seeds & ghee" },
      { name: "Lemon Rice", price: 80, description: "Tangy South Indian lemon mustard seed rice" },
      { name: "Tomato Rice", price: 80, description: "Spiced tomato herb basmati rice" },
      { name: "Curd Rice", price: 100, description: "Cooling yogurt rice tempered with mustard & curry leaves" },
      { name: "Kaju Tawa Rice", price: 130, description: "Tawa rice tossed with roasted cashew nuts" },
      { name: "Paneer Rice", price: 150, description: "Basmati rice cooked with paneer cubes" },
      { name: "Veg Pulao", price: 170, description: "Aromatic mild spiced veggie basmati pulao" },
    ],
  },
  {
    category: "Gravy Sabji",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500",
    items: [
      { name: "Aloo Jeera", price: 110, description: "Dry potato cubes tossed with cumin & coriander" },
      { name: "Aloo Gravy", price: 120, description: "Home style potato curry in tomato gravy" },
      { name: "Tamatar Chatni", price: 130, description: "Spicy sweet & tangy tomato chutney curry" },
      { name: "Aloo Gobhi Matar", price: 140, description: "Potato, cauliflower & green peas masala curry" },
      { name: "Chana Masala", price: 140, description: "Spicy North Indian chickpea curry" },
      { name: "Sev Tamatar", price: 140, description: "Crispy ratlami sev in spicy tomato gravy" },
      { name: "Soyabin Gravy", price: 140, description: "High protein soya chunks in onion tomato curry" },
      { name: "Veg Kadhai", price: 150, description: "Mixed veggies cooked in kadhai gravy with freshly ground spices" },
      { name: "Veg Mix Gravy", price: 150, description: "Assorted vegetables in rich yellow gravy" },
      { name: "Corn Palak", price: 150, description: "Sweet corn cooked in smooth spinach puree" },
      { name: "Veg Kolhapuri", price: 160, description: "Spicy Maharashtrian Kolhapuri style veg curry" },
      { name: "Paneer Masala", price: 170, description: "Cottage cheese cubes in rich spiced onion gravy" },
      { name: "Palak Paneer", price: 170, description: "Paneer cubes in creamy spinach curry" },
      { name: "Paneer Bhurji Curry/Dry", price: 170, description: "Scrambled paneer with onions, tomatoes & green chillies" },
      { name: "Paneer Lababdar", price: 180, description: "Rich creamy paneer in tomato cashew gravy" },
      { name: "Mushroom Masala Lapeta", price: 180, description: "Button mushrooms coated in thick semi-dry masala" },
      { name: "Paneer Butter Masala", price: 180, description: "Soft paneer in silky sweet & spicy butter gravy" },
      { name: "Matar Paneer Gravy", price: 180, description: "Classic green peas and paneer curry" },
      { name: "Paneer Shahi Korma", price: 180, description: "Royal mild cashew cream paneer gravy" },
      { name: "Punjabi Paneer", price: 180, description: "Rustic Punjabi style spiced paneer curry" },
      { name: "Shahi Paneer", price: 190, description: "Rich Mughlai style creamy paneer gravy" },
      { name: "Paneer Kolhapuri", price: 190, description: "Fiery Kolhapuri spiced paneer curry" },
      { name: "Palak Mushroom Paneer", price: 190, description: "Spinach curry with mushrooms & paneer" },
      { name: "Veg Mix Kofta", price: 190, description: "Crispy veg balls in savory curry" },
      { name: "Paneer Kofta", price: 200, description: "Stuffed paneer balls in rich golden gravy" },
      { name: "Kadai Paneer", price: 200, description: "Paneer with bell peppers tossed in kadai spices" },
      { name: "Malai Kofta", price: 210, description: "Melt-in-mouth paneer dumplings in sweet cashew cream" },
      { name: "Kaju Masala", price: 210, description: "Roasted cashews cooked in spicy tomato onion gravy" },
      { name: "Kaju Korma", price: 210, description: "Rich creamy cashews in mild white gravy" },
      { name: "Kaju Butter Masala", price: 210, description: "Cashews cooked in rich butter gravy" },
      { name: "Kaju Kolhapuri", price: 220, description: "Spicy Kolhapuri gravy with roasted cashews" },
      { name: "Kaju Kadhai", price: 220, description: "Cashews and bell peppers in kadhai masala" },
      { name: "Paneer Kaju Masala", price: 230, description: "Combo of paneer cubes & cashews in rich gravy" },
      { name: "Paneer Pasanda", price: 240, description: "Stuffed paneer triangles in rich Mughlai gravy" },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB...");

  let catsCount = 0;
  let itemsCount = 0;

  for (const group of MENU_DATA) {
    let cat = await MenuCategory.findOne({ name: group.category });
    if (!cat) {
      cat = await MenuCategory.create({ name: group.category, active: true });
      catsCount++;
    }

    for (const item of group.items) {
      await MenuItem.findOneAndUpdate(
        { name: item.name, categoryId: cat._id },
        {
          categoryId: cat._id,
          name: item.name,
          price: item.price,
          description: item.description,
          imageUrl: group.imageUrl,
          available: true,
        },
        { upsert: true, new: true }
      );
      itemsCount++;
    }
  }

  console.log(`Seeding complete! Total Categories: ${await MenuCategory.countDocuments()}, Total Menu Items: ${await MenuItem.countDocuments()}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
