const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Recipe = require('../models/Recipe');

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
afterEach(async () => {
  await Recipe.deleteMany({});
});

describe('Recipe model - high priority tests', () => {
  test('validation: missing required fields should fail', async () => {
    const r = new Recipe({});
    let err;
    try {
      await r.save();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError');
    expect(err.errors.title).toBeDefined();
    expect(err.errors.image).toBeDefined();
  });

  test('create, read, update, delete lifecycle', async () => {
    const doc = {
      title: 'Test Recipe',
      image: 'img.png',
      description: 'desc',
      country: 'Korea',
      mainIngredient: 'Beef',
      allergens: ['Peanuts'],
      cookTime: '30m',
      rating: 4,
      ingredients: [{ id: 'ing1', name: 'Salt', quantity: '1tsp' }],
      instructions: 'Do it',
      nutrition: { Calories: '200' }
    };

    const created = await Recipe.create(doc);
    expect(created._id).toBeDefined();

    const found = await Recipe.findById(created._id);
    expect(found.title).toBe(doc.title);

    found.title = 'Updated Recipe';
    await found.save();
    const updated = await Recipe.findById(created._id);
    expect(updated.title).toBe('Updated Recipe');

    await Recipe.findByIdAndDelete(created._id);
    const afterDelete = await Recipe.findById(created._id);
    expect(afterDelete).toBeNull();
  });

  test('filterRecipes: filter by country/mainIngredient and exclude allergens', async () => {
    await Recipe.create({
      title: 'A', image: 'i', description: 'd', country: 'Korea', mainIngredient: 'Beef', allergens: ['Peanuts'], cookTime: '10', rating: 3, ingredients: [], instructions: 'x'
    });
    await Recipe.create({
      title: 'B', image: 'i', description: 'd', country: 'Japan', mainIngredient: 'Pork', allergens: [], cookTime: '15', rating: 4, ingredients: [], instructions: 'y'
    });

    const byCountry = await Recipe.filterRecipes({ country: ['Korea'] });
    expect(byCountry).toHaveLength(1);
    expect(byCountry[0].title).toBe('A');

    // Exclude recipes that contain 'Peanuts'
    const notPeanut = await Recipe.filterRecipes({ allergens: ['Peanuts'] });
    // filterRecipes uses $nin, so recipes containing Peanuts should be excluded
    expect(notPeanut.find(r => r.title === 'A')).toBeUndefined();
  });

  test('getCountries/getMainIngredients/getAllergens', async () => {
    await Recipe.create({ title: 'r1', image: 'i', description: 'd', country: 'K', mainIngredient: 'X', cookTime: '1', rating: 1, ingredients: [], instructions: 'i', allergens: ['Peanuts','Shellfish'] });
    await Recipe.create({ title: 'r2', image: 'i', description: 'd', country: 'K2', mainIngredient: 'Y', cookTime: '1', rating: 1, ingredients: [], instructions: 'i', allergens: ['Peanuts'] });

    const countries = await Recipe.getCountries();
    expect(countries).toEqual(expect.arrayContaining(['K','K2']));

    const mains = await Recipe.getMainIngredients();
    expect(mains).toEqual(expect.arrayContaining(['X','Y']));

    const alls = await Recipe.getAllergens();
    expect(alls).toEqual(expect.arrayContaining(['Peanuts','Shellfish']));
  });
});

describe('Recipe model - mid priority tests', () => {
  test('text search finds title/description keywords', async () => {
    // create some docs
    await Recipe.create({ title: 'Spicy Beef Noodles', image: 'i', description: 'hot and tasty', country: 'CN', mainIngredient: 'Beef', cookTime: '20', rating: 5, ingredients: [], instructions: 'cook' });
    await Recipe.create({ title: 'Sweet Pork', image: 'i', description: 'sweet', country: 'CN', mainIngredient: 'Pork', cookTime: '25', rating: 4, ingredients: [], instructions: 'cook' });

    // text search for 'spicy'
    const hits = await Recipe.find({ $text: { $search: 'spicy' } });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some(h => /Spicy/i.test(h.title))).toBe(true);
  });

  test('pagination and sorting by rating', async () => {
    // create multiple docs with different ratings
    await Recipe.create({ title: 'R1', image: 'i', description: 'd', country: 'X', mainIngredient: 'A', cookTime: '1', rating: 2, ingredients: [], instructions: 'i' });
    await Recipe.create({ title: 'R2', image: 'i', description: 'd', country: 'X', mainIngredient: 'A', cookTime: '1', rating: 5, ingredients: [], instructions: 'i' });
    await Recipe.create({ title: 'R3', image: 'i', description: 'd', country: 'X', mainIngredient: 'A', cookTime: '1', rating: 4, ingredients: [], instructions: 'i' });

    const page = await Recipe.find({ country: 'X' }).sort({ rating: -1 }).limit(2).skip(0);
    expect(page[0].rating).toBeGreaterThanOrEqual(page[1].rating);
    expect(page).toHaveLength(2);
  });
});
