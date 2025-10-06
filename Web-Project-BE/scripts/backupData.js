// backupData.js - 备份现有数据库数据
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

// 导入模型
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

async function backupData() {
  try {
    // 连接到MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for backup');

    // 创建备份目录
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // 生成时间戳
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 备份食谱数据
    const recipes = await Recipe.find({});
    const recipesBackup = {
      timestamp: new Date().toISOString(),
      count: recipes.length,
      data: recipes
    };
    
    const recipesBackupPath = path.join(backupDir, `recipes_backup_${timestamp}.json`);
    fs.writeFileSync(recipesBackupPath, JSON.stringify(recipesBackup, null, 2));
    console.log(`✅ Recipes backed up to: ${recipesBackupPath}`);
    console.log(`   - Total recipes: ${recipes.length}`);

    // 备份食材数据
    const ingredients = await Ingredient.find({});
    const ingredientsBackup = {
      timestamp: new Date().toISOString(),
      count: ingredients.length,
      data: ingredients
    };
    
    const ingredientsBackupPath = path.join(backupDir, `ingredients_backup_${timestamp}.json`);
    fs.writeFileSync(ingredientsBackupPath, JSON.stringify(ingredientsBackup, null, 2));
    console.log(`✅ Ingredients backed up to: ${ingredientsBackupPath}`);
    console.log(`   - Total ingredients: ${ingredients.length}`);

    // 显示备份的食谱标题
    if (recipes.length > 0) {
      console.log('\n📋 Backed up recipes:');
      recipes.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.title} (${recipe.country})`);
      });
    }

    // 显示备份的食材名称
    if (ingredients.length > 0) {
      console.log('\n🥘 Backed up ingredients:');
      ingredients.forEach((ingredient, index) => {
        console.log(`   ${index + 1}. ${ingredient.name} - €${ingredient.price}`);
      });
    }

    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup files saved in: ${backupDir}`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// 运行备份脚本
if (require.main === module) {
  backupData();
}

module.exports = { backupData };
