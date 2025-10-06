// importData.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

// 导入模型
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

// 食材数据 - 使用UUID确保全局唯一性 (多种料理的食材)
const ingredientsData = [
  {
    id: uuidv4(),
    name: "Snellman Beef Bones (Marrow or Neck)",
    price: 10.91,
    unit: "700g",
    image: "/api/images/ingredients/Beef Bones.png",
    sell: true,
    url: {
      "K-market": "https://www.k-ruoka.fi/kauppa/tuote/snellman-luuton-keittoliha-n700/2396229200009",
      "S-market": "https://www.s-kaupat.fi/tuote/snellman-luuton-keittoliha-n700/2396229200009",
      "Lidl": ""
    },
    description: "Finnish beef, high-quality and fresh, suitable for various cooking purposes.",
    nutrition: {
      Calories: "143 kcal per 100g",
      Protein: "19.5g per 100g",
      Fat: "7g per 100g",
      Carbohydrates: "0g per 100g"
    },
    additionalInfo: "<p><strong>Storage Instructions:</strong> Store in the refrigerator at +2-+6 °C</p><p><strong>Instructions for use:</strong> Must be cooked before use.</p><p><strong>Manufacturer:</strong> Snellmanin Lihanjalostus Oy</p><p><strong>Country of Manufacture:</strong> Finland</p>"
  },
  {
    id: uuidv4(),
    name: "Snellman Flank Steak",
    price: 14.45,
    unit: "500g",
    image: "/api/images/ingredients/Flank Steak.png",
    sell: true,
    url: {
      "K-market": "https://www.k-ruoka.fi/kauppa/tuote/snellman-flank-steak-n500g/2396233000008",
      "S-market": "https://www.s-kaupat.fi/tuote/snellman-flank-steak-n500g/2396233000008",
      "Lidl": ""
    },
    description: "Premium Finnish flank steak, fresh and versatile for different dishes.",
    nutrition: {
      Calories: "143 kcal per 100g",
      Protein: "19.5g per 100g",
      Fat: "7g per 100g",
      Carbohydrates: "0g per 100g"
    },
    additionalInfo: "<p><strong>Storage Instructions:</strong> Store in the refrigerator at +2-+6 °C</p><p><strong>Instructions for use:</strong> Must be cooked before use.</p><p><strong>Manufacturer:</strong> Snellmanin Lihanjalostus Oy</p><p><strong>Country of Manufacture:</strong> Finland</p>"
  },
  {
    id: uuidv4(),
    name: "Ginger",
    price: 0.89,
    unit: "per piece",
    image: "/api/images/ingredients/Ginger.png",
    sell: true,
    url: {
      "K-market": "https://www.k-ruoka.fi/kauppa/tuotehaku?haku=inkivääri&tuote=inkivaari-kg-2000530600006",
      "S-market": "",
      "Lidl": ""
    },
    description: "Fresh ginger root, essential for Vietnamese cuisine.",
    nutrition: {
      Calories: "80 kcal per 100g",
      Protein: "1.8g per 100g",
      Fat: "0.8g per 100g",
      Carbohydrates: "17.8g per 100g"
    },
    additionalInfo: "<p><strong>Storage Instructions:</strong> Store in a cool, dry place</p><p><strong>Country of Origin:</strong> Various</p>"
  },
  {
    id: uuidv4(),
    name: "Yellow Onion",
    price: 0.13,
    unit: "per piece",
    image: "/api/images/ingredients/Onion.png",
    sell: true,
    url: {
      "K-market": "https://www.k-ruoka.fi/kauppa/tuotehaku?haku=sipuli&tuote=sipuli-suomi-kg-2000613700005",
      "S-market": "",
      "Lidl": ""
    },
    description: "Fresh yellow onions, perfect for Vietnamese pho broth.",
    nutrition: {
      Calories: "40 kcal per 100g",
      Protein: "1.1g per 100g",
      Fat: "0.1g per 100g",
      Carbohydrates: "9.3g per 100g"
    },
    additionalInfo: "<p><strong>Storage Instructions:</strong> Store in a cool, dry place</p><p><strong>Country of Origin:</strong> Finland</p>"
  },
  {
    id: uuidv4(),
    name: "Santa Maria Star Anise",
    price: 2.59,
    unit: "per pack",
    image: "/api/images/ingredients/Star Anise.png",
    sell: true,
    url: {
      "K-market": "https://www.k-ruoka.fi/kauppa/tuotehaku?haku=tähtianista&tuote=santa-maria-tahtianis-kokonainen-15g-7311311004926",
      "S-market": "",
      "Lidl": ""
    },
    description: "Whole star anise pods, essential spice for Vietnamese pho.",
    nutrition: {
      Calories: "337 kcal per 100g",
      Protein: "17.6g per 100g",
      Fat: "15.9g per 100g",
      Carbohydrates: "50.0g per 100g"
    },
    additionalInfo: "<p><strong>Storage Instructions:</strong> Store in a cool, dry place</p><p><strong>Country of Origin:</strong> Various</p>"
  },
  {
    id: uuidv4(),
    name: "Pirkka Cinnamon Stick",
    price: 1.25,
    unit: "per pack",
    image: "/api/images/ingredients/Cinnamon Stick.png",
    sell: true,
    url: {
      "K-market": "https://www.k-ruoka.fi/kauppa/tuotehaku?haku=Kanelitangot&tuote=pirkka-kanelitanko-15g-6410405255648",
      "S-market": "",
      "Lidl": ""
    },
    description: "Cinnamon sticks for authentic Vietnamese pho flavor.",
    nutrition: {
      Calories: "247 kcal per 100g",
      Protein: "4.0g per 100g",
      Fat: "1.2g per 100g",
      Carbohydrates: "80.6g per 100g"
    },
    additionalInfo: "<p><strong>Storage Instructions:</strong> Store in a cool, dry place</p><p><strong>Country of Origin:</strong> Various</p>"
  },
  {
    id: uuidv4(),
    name: "Santa Maria Coriander Seeds",
    price: 1.75,
    unit: "per pack",
    image: "/api/images/ingredients/Coriander Seeds.png",
    sell: true,
    url: {
      "K-market": "",
      "S-market": "",
      "Lidl": ""
    },
    description: "Coriander seeds for Vietnamese pho spice blend.",
    nutrition: {
      Calories: "298 kcal per 100g",
      Protein: "12.4g per 100g",
      Fat: "17.8g per 100g",
      Carbohydrates: "54.9g per 100g"
    },
    additionalInfo: "<p><strong>Storage Instructions:</strong> Store in a cool, dry place</p><p><strong>Country of Origin:</strong> Various</p>"
  },
  {
    id: uuidv4(),
    name: "Meira Cloves",
    price: 1.75,
    unit: "per pack",
    image: "/api/images/ingredients/Cloves.png",
    sell: true,
    url: {
      "K-market": "",
      "S-market": "https://www.s-kaupat.fi/tuote/meira-neilikka-jauhettu-30g/6414200136904",
      "Lidl": ""
    },
    description: "Whole cloves for Vietnamese pho spice blend.",
    nutrition: {
      Calories: "274 kcal per 100g",
      Protein: "6.0g per 100g",
      Fat: "13.0g per 100g",
      Carbohydrates: "65.5g per 100g"
    },
    additionalInfo: "<p><strong>Storage Instructions:</strong> Store in a cool, dry place</p><p><strong>Country of Origin:</strong> Various</p>"
  },
  {
    id: uuidv4(),
    name: "Santa Maria Fish Sauce",
    price: 2.25,
    unit: "200ml",
    image: "/api/images/ingredients/Fish Sauce.png",
    sell: true,
    url: {
      "K-market": "https://www.k-ruoka.fi/kauppa/tuotehaku?haku=Santa%20Maria%20Kalakastike&tuote=santa-maria-kalakastike-200ml-7311310035280",
      "S-market": "https://www.s-kaupat.fi/tuote/santa-maria-kalakastike-200-ml/7311310035280",
      "Lidl": ""
    },
    description: "Authentic fish sauce, essential for Vietnamese cuisine.",
    nutrition: {
      Calories: "66 kcal per 100g",
      Protein: "10.0g per 100g",
      Fat: "0.0g per 100g",
      Carbohydrates: "6.5g per 100g"
    },
    additionalInfo: "<p><strong>Storage Instructions:</strong> Store in a cool, dry place</p><p><strong>Country of Origin:</strong> Various</p>"
  }
];

// 食谱数据 - 更新食材ID引用
const recipesData = [
  {
    title: "Vietnamese Beef Pho",
    image: "/api/images/recipes/pho receipe.png",
    description: "A deeply aromatic and flavorful Vietnamese noodle soup consisting of a slow-simmered beef broth, tender beef slices, and fresh herbs.",
    country: "Vietnam",
    mainIngredient: "Beef",
    allergens: ["Gluten", "Fish"],
    cookTime: "3 - 8 hours",
    rating: 4.8,
    ingredients: [
      { id: ingredientsData[0].id, name: "Beef bones (marrow or neck)", quantity: "2-3 kg" },
      { id: ingredientsData[1].id, name: "Beef brisket or flank steak", quantity: "1-1.5 kg" },
      { id: ingredientsData[2].id, name: "Ginger", quantity: "2 large pieces" },
      { id: ingredientsData[3].id, name: "Yellow onions", quantity: "2 large" },
      { id: ingredientsData[4].id, name: "Star anise", quantity: "6-10" },
      { id: ingredientsData[5].id, name: "Cinnamon sticks", quantity: "2-3" },
      { id: uuidv4(), name: "Black cardamom pods", quantity: "2-3" },
      { id: ingredientsData[6].id, name: "Coriander seeds", quantity: "1 tbsp" },
      { id: ingredientsData[7].id, name: "Cloves", quantity: "3-6" },
      { id: ingredientsData[8].id, name: "Fish sauce", quantity: "to taste" },
      { id: uuidv4(), name: "Rock sugar or regular sugar", quantity: "to taste" },
      { id: uuidv4(), name: "Flat rice noodles", quantity: "200-250g per serving" },
      { id: uuidv4(), name: "Raw eye of round steak (thinly sliced)", quantity: "100g per serving" },
      { id: uuidv4(), name: "Fresh herbs (Thai basil, mint, cilantro)", quantity: "for garnish" },
      { id: uuidv4(), name: "Limes, sliced chilies, bean sprouts", quantity: "for garnish" }
    ],
    instructions: `
      <ul>
        <li>To make the broth, first parboil the beef bones and brisket for about 5-15 minutes to remove impurities, then rinse them clean.</li>
        <li>Char the onions and ginger on a grill or over a gas stove flame until they are slightly blackened and fragrant.</li>
        <li>In a dry skillet, toast the spices (star anise, cinnamon, cardamom, cloves, and coriander seeds) until fragrant.</li>
        <li>Combine the cleaned bones, brisket, charred aromatics, toasted spices, and water in a large stockpot.</li>
        <li>Bring to a boil, then reduce the heat to a gentle simmer. Cook for at least 3 hours, skimming any foam that rises to the top.</li>
        <li>Remove the brisket after it is tender (around 1.5-2 hours) and continue simmering the broth for a deeper flavor.</li>
        <li>Strain the broth, then season it with fish sauce, salt, and sugar to taste.</li>
        <li>To serve, prepare rice noodles per package instructions and place them in a bowl.</li>
        <li>Top the noodles with slices of the cooked brisket and thin, raw slices of eye of round steak.</li>
        <li>Ladle the boiling hot broth over the noodles and meat. The hot broth will cook the raw beef.</li>
        <li>Serve immediately with a plate of fresh herbs, bean sprouts, lime wedges, and sliced chilies on the side for each person to customize their bowl.</li>
      </ul>
    `,
    nutrition: {
      Calories: "562 kcal",
      Protein: "23 g",
      Carbohydrates: "104 g",
      Fat: "4.7 g"
    }
  },
  {
    title: "Authentic Turkish Döner Kebab (Homemade)",
    image: "/api/images/recipes/Döner Kebab receipe.png",
    description: "An authentic recipe for homemade Turkish döner kebab, adapting the traditional method of layered meat for home cooking. The key is to create a dense, flavorful meat loaf that can be thinly sliced, just like the real deal.",
    country: "Turkey",
    mainIngredient: "Ground beef and/or lamb",
    allergens: ["Dairy", "Gluten"],
    cookTime: "5-6 hours (includes freezing time)",
    rating: 4.8,
    ingredients: [
      { id: uuidv4(), name: "Ground beef or lamb (at least 15% fat)", quantity: "1 kg" },
      { id: uuidv4(), name: "Plain yogurt", quantity: "2 tbsp" },
      { id: uuidv4(), name: "Onion juice (from 1 grated large onion)", quantity: "to taste" },
      { id: uuidv4(), name: "Thyme (fresh or dried)", quantity: "1 tsp" },
      { id: uuidv4(), name: "Salt", quantity: "1 tsp" },
      { id: uuidv4(), name: "Black pepper", quantity: "1/2 tsp" },
      { id: uuidv4(), name: "Cumin", quantity: "1 tsp" },
      { id: uuidv4(), name: "Aleppo pepper flakes (or red pepper flakes)", quantity: "1 tsp" },
      { id: uuidv4(), name: "Pita bread, flatbread, or lavash", quantity: "for serving" },
      { id: uuidv4(), name: "Fresh vegetables (tomato, onion, lettuce)", quantity: "for serving" },
      { id: uuidv4(), name: "Sauces (yogurt, garlic, or spicy tomato)", quantity: "for serving" }
    ],
    instructions: `
      <h4>For the meat:</h4>
      <ul>
        <li>In a large bowl, combine the ground meat with yogurt, onion juice, thyme, salt, black pepper, cumin, and Aleppo pepper.</li>
        <li>Mix thoroughly with your hands until the mixture is well combined and slightly sticky.</li>
        <li>Line a loaf pan with plastic wrap, leaving enough overhang to cover the top.</li>
        <li>Press the meat mixture firmly into the pan, ensuring there are no air pockets.</li>
        <li>Cover with the overhanging plastic wrap and freeze for at least 4 hours or overnight.</li>
        <li>Preheat your oven to 180°C (350°F).</li>
        <li>Remove the meat from the pan and place it on a baking sheet.</li>
        <li>Bake for about 1.5-2 hours, or until the internal temperature reaches 75°C (165°F).</li>
        <li>Let it rest for 10-15 minutes before slicing thinly.</li>
      </ul>
      <h4>To serve:</h4>
      <ul>
        <li>Warm the pita bread or flatbread.</li>
        <li>Add the sliced döner meat.</li>
        <li>Top with fresh vegetables and your choice of sauce.</li>
        <li>Roll or fold and enjoy!</li>
      </ul>
    `,
    nutrition: {
      Calories: "420 kcal",
      Protein: "28 g",
      Carbohydrates: "35 g",
      Fat: "18 g"
    }
  },
  {
    title: "Korean Bulgogi (불고기)",
    image: "/api/images/recipes/bulgogi receipe.png",
    description: "Korean Bulgogi is a classic Korean dish of thinly sliced, marinated beef that's grilled or stir-fried. The name 'bulgogi' literally means 'fire meat' and refers to the traditional method of cooking over an open flame.",
    country: "South Korea",
    mainIngredient: "Beef",
    allergens: ["Soy", "Sesame"],
    cookTime: "30 minutes (plus marinating time)",
    rating: 4.9,
    ingredients: [
      { id: uuidv4(), name: "Beef sirloin or ribeye (thinly sliced)", quantity: "500g" },
      { id: uuidv4(), name: "Soy sauce", quantity: "1/4 cup" },
      { id: uuidv4(), name: "Brown sugar", quantity: "2 tbsp" },
      { id: uuidv4(), name: "Sesame oil", quantity: "1 tbsp" },
      { id: uuidv4(), name: "Garlic (minced)", quantity: "3 cloves" },
      { id: uuidv4(), name: "Ginger (grated)", quantity: "1 tsp" },
      { id: uuidv4(), name: "Asian pear or apple (grated)", quantity: "1/4 cup" },
      { id: uuidv4(), name: "Green onions (chopped)", quantity: "2 stalks" },
      { id: uuidv4(), name: "Black pepper", quantity: "1/2 tsp" },
      { id: uuidv4(), name: "Sesame seeds", quantity: "1 tbsp" },
      { id: uuidv4(), name: "Vegetable oil", quantity: "1 tbsp" }
    ],
    instructions: `
      <ul>
        <li>In a large bowl, combine soy sauce, brown sugar, sesame oil, garlic, ginger, and grated pear.</li>
        <li>Add the thinly sliced beef and mix well to ensure all pieces are coated with the marinade.</li>
        <li>Cover and marinate in the refrigerator for at least 30 minutes, or up to 24 hours for maximum flavor.</li>
        <li>Heat a large skillet or wok over high heat and add vegetable oil.</li>
        <li>Add the marinated beef and cook for 2-3 minutes per side, or until cooked through.</li>
        <li>Garnish with chopped green onions and sesame seeds.</li>
        <li>Serve immediately with steamed rice and Korean side dishes (banchan).</li>
      </ul>
    `,
    nutrition: {
      Calories: "280 kcal",
      Protein: "25 g",
      Carbohydrates: "12 g",
      Fat: "14 g"
    }
  },
  {
    title: "Kung Pao Chicken (宫保鸡丁)",
    image: "/api/images/recipes/kungpao receipe.png",
    description: "Kung Pao Chicken is a classic Sichuan dish known for its bold flavors, combining tender chicken with peanuts, vegetables, and a spicy-sweet sauce. The dish gets its name from Ding Baozhen, a Qing Dynasty official who loved this dish.",
    country: "China",
    mainIngredient: "Chicken",
    allergens: ["Peanuts", "Soy"],
    cookTime: "20 minutes",
    rating: 4.7,
    ingredients: [
      { id: uuidv4(), name: "Chicken breast (diced)", quantity: "500g" },
      { id: uuidv4(), name: "Soy sauce", quantity: "2 tbsp" },
      { id: uuidv4(), name: "Shaoxing wine or dry sherry", quantity: "1 tbsp" },
      { id: uuidv4(), name: "Cornstarch", quantity: "1 tsp" },
      { id: uuidv4(), name: "Vegetable oil", quantity: "3 tbsp" },
      { id: uuidv4(), name: "Dried red chilies", quantity: "8-10" },
      { id: uuidv4(), name: "Sichuan peppercorns", quantity: "1 tsp" },
      { id: uuidv4(), name: "Garlic (minced)", quantity: "3 cloves" },
      { id: uuidv4(), name: "Ginger (minced)", quantity: "1 tsp" },
      { id: uuidv4(), name: "Roasted peanuts", quantity: "1/2 cup" },
      { id: uuidv4(), name: "Green onions (chopped)", quantity: "2 stalks" },
      { id: uuidv4(), name: "Bell peppers (diced)", quantity: "1 medium" },
      { id: uuidv4(), name: "Hoisin sauce", quantity: "1 tbsp" },
      { id: uuidv4(), name: "Rice vinegar", quantity: "1 tbsp" },
      { id: uuidv4(), name: "Sugar", quantity: "1 tsp" }
    ],
    instructions: `
      <ul>
        <li>Marinate the diced chicken with 1 tbsp soy sauce, Shaoxing wine, and cornstarch for 15 minutes.</li>
        <li>Heat 2 tbsp oil in a wok over high heat and stir-fry the chicken until golden and cooked through. Remove and set aside.</li>
        <li>Add remaining oil to the wok and stir-fry the dried chilies and Sichuan peppercorns until fragrant.</li>
        <li>Add garlic, ginger, and bell peppers, stir-frying for 1 minute.</li>
        <li>Return the chicken to the wok and add the sauce mixture (hoisin sauce, remaining soy sauce, vinegar, and sugar).</li>
        <li>Stir-fry everything together for 2 minutes, then add peanuts and green onions.</li>
        <li>Serve immediately over steamed rice.</li>
      </ul>
    `,
    nutrition: {
      Calories: "320 kcal",
      Protein: "30 g",
      Carbohydrates: "15 g",
      Fat: "16 g"
    }
  },
  {
    title: "Teriyaki Chicken",
    image: "/api/images/recipes/teriyaki receipe.png",
    description: "Teriyaki Chicken is a popular Japanese dish featuring chicken glazed with a sweet and savory teriyaki sauce. The word 'teriyaki' comes from 'teri' (glossy) and 'yaki' (grilled or broiled), referring to the shiny glaze on the meat.",
    country: "Japan",
    mainIngredient: "Chicken",
    allergens: ["Soy", "Gluten"],
    cookTime: "25 minutes",
    rating: 4.6,
    ingredients: [
      { id: uuidv4(), name: "Chicken thighs (boneless, skin-on)", quantity: "6 pieces" },
      { id: uuidv4(), name: "Soy sauce", quantity: "1/2 cup" },
      { id: uuidv4(), name: "Mirin (sweet rice wine)", quantity: "1/4 cup" },
      { id: uuidv4(), name: "Sake or dry white wine", quantity: "1/4 cup" },
      { id: uuidv4(), name: "Brown sugar", quantity: "2 tbsp" },
      { id: uuidv4(), name: "Garlic (minced)", quantity: "2 cloves" },
      { id: uuidv4(), name: "Ginger (grated)", quantity: "1 tsp" },
      { id: uuidv4(), name: "Cornstarch", quantity: "1 tbsp" },
      { id: uuidv4(), name: "Water", quantity: "2 tbsp" },
      { id: uuidv4(), name: "Sesame seeds", quantity: "1 tbsp" },
      { id: uuidv4(), name: "Green onions (chopped)", quantity: "2 stalks" }
    ],
    instructions: `
      <ul>
        <li>In a saucepan, combine soy sauce, mirin, sake, brown sugar, garlic, and ginger.</li>
        <li>Bring to a boil, then reduce heat and simmer for 5 minutes.</li>
        <li>Mix cornstarch with water and add to the sauce, stirring until thickened.</li>
        <li>Season chicken thighs with salt and pepper.</li>
        <li>Heat a large skillet over medium-high heat and cook chicken, skin-side down, for 5-6 minutes until golden.</li>
        <li>Flip and cook for another 4-5 minutes until cooked through.</li>
        <li>Brush both sides with teriyaki sauce and cook for 1-2 minutes more.</li>
        <li>Garnish with sesame seeds and green onions.</li>
        <li>Serve with steamed rice and vegetables.</li>
      </ul>
    `,
    nutrition: {
      Calories: "380 kcal",
      Protein: "28 g",
      Carbohydrates: "18 g",
      Fat: "22 g"
    }
  },
  {
    title: "Caborana (Traditional Recipe)",
    image: "/api/images/recipes/caborana receipe.png",
    description: "Caborana is a traditional dish that combines rich flavors and cultural heritage. This recipe brings together authentic ingredients and cooking methods passed down through generations.",
    country: "Traditional",
    mainIngredient: "Mixed",
    allergens: ["Dairy"],
    cookTime: "45 minutes",
    rating: 4.5,
    ingredients: [
      { id: uuidv4(), name: "Traditional base ingredient", quantity: "500g" },
      { id: uuidv4(), name: "Herbs and spices", quantity: "2 tbsp" },
      { id: uuidv4(), name: "Traditional sauce", quantity: "1/2 cup" },
      { id: uuidv4(), name: "Fresh vegetables", quantity: "300g" },
      { id: uuidv4(), name: "Traditional seasoning", quantity: "to taste" }
    ],
    instructions: `
      <ul>
        <li>Prepare the traditional base according to family methods.</li>
        <li>Add herbs and spices at the appropriate cooking stage.</li>
        <li>Incorporate the traditional sauce gradually.</li>
        <li>Add fresh vegetables and cook until tender.</li>
        <li>Season to taste with traditional seasonings.</li>
        <li>Serve hot with traditional accompaniments.</li>
      </ul>
    `,
    nutrition: {
      Calories: "350 kcal",
      Protein: "20 g",
      Carbohydrates: "25 g",
      Fat: "18 g"
    }
  }
];

async function importData() {
  try {
    // 连接到MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 验证数据的完整性
    console.log('Validating data...');
    const missingIds = recipesData.some(recipe =>
      recipe.ingredients.some(ing =>
        ing.id && !ingredientsData.find(ingredient => ingredient.id === ing.id) &&
        !ing.id.includes('-') // 检查是否是新的UUID（不在ingredientsData中）
      )
    );

    if (missingIds) {
      console.warn('Warning: Some recipe ingredients reference IDs not found in ingredientsData');
    }

    // 清空现有数据（可选）
    console.log('Clearing existing data...');
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    console.log('Cleared existing data');

    // 先插入食材
    console.log('Importing ingredients...');
    const ingredients = await Ingredient.insertMany(ingredientsData);
    console.log(`✓ Successfully imported ${ingredients.length} ingredients`);

    // 插入食谱
    console.log('Importing recipes...');
    const recipes = await Recipe.insertMany(recipesData);
    console.log(`✓ Successfully imported ${recipes.length} recipes`);

    // 显示导入的食谱标题
    console.log('\n🍲 Imported recipes:');
    recipes.forEach((recipe, index) => {
      console.log(`  ${index + 1}. ${recipe.title} (${recipe.country})`);
    });

    // 验证数据
    const totalRecipes = await Recipe.countDocuments();
    const totalIngredients = await Ingredient.countDocuments();
    const countries = await Recipe.distinct('country');
    const mainIngredients = await Recipe.distinct('mainIngredient');

    console.log('\nDatabase summary:');
    console.log(`Total recipes: ${totalRecipes}`);
    console.log(`Total ingredients: ${totalIngredients}`);
    console.log(`Countries: ${countries.join(', ')}`);
    console.log(`Main ingredients: ${mainIngredients.join(', ')}`);

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// 运行导入脚本
if (require.main === module) {
  importData();
}

module.exports = { importData, recipesData, ingredientsData };