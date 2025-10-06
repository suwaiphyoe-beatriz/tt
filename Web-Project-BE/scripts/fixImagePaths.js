const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recipe = require('../models/Recipe');

// 加载环境变量
dotenv.config();

// 图片路径映射 - 从 /src/assets/ 改为 /assets/
const imagePathUpdates = [
  { from: "/src/assets/pho receipe.png", to: "/assets/pho receipe.png" },
  { from: "/src/assets/Döner Kebab receipe.png", to: "/assets/Döner Kebab receipe.png" },
  { from: "/src/assets/bulgogi receipe.png", to: "/assets/bulgogi receipe.png" },
  { from: "/src/assets/kungpao receipe.png", to: "/assets/kungpao receipe.png" },
  { from: "/src/assets/teriyaki receipe.png", to: "/assets/teriyaki receipe.png" },
  { from: "/src/assets/caborana receipe.png", to: "/assets/caborana receipe.png" }
];

async function fixImagePaths() {
  try {
    // 连接到MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let totalUpdated = 0;

    // 更新每个图片路径
    for (const update of imagePathUpdates) {
      const result = await Recipe.updateMany(
        { image: update.from },
        { $set: { image: update.to } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${result.modifiedCount} recipes: ${update.from} -> ${update.to}`);
        totalUpdated += result.modifiedCount;
      }
    }

    console.log(`\n🎉 Total recipes updated: ${totalUpdated}`);

    // 验证更新结果
    const recipes = await Recipe.find({}).select('title image');
    console.log('\n📋 Current recipe images:');
    recipes.forEach(recipe => {
      console.log(`  ${recipe.title}: ${recipe.image}`);
    });

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// 运行修复脚本
if (require.main === module) {
  fixImagePaths();
}

module.exports = { fixImagePaths };
