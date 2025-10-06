```jsx
{
  "id": 1,
  "title": "Spaghetti Carbonara",
  "image": "",
  "description": "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
  "country": "Italy",
  "mainIngredient": "Pasta",
  "allergens": ["Gluten", "Eggs", "Dairy"],
  "cookTime": "25 minutes",
  "rating": 4.5,
  "isBookmarked": false,

  "ingredients": [
    {
      "id": "1",
      "name": "Spaghetti",
      "quantity": "200g"
    },
    {
      "id": "2",
      "name": "Pancetta (or bacon)",
      "quantity": "100g"
    },
    {
      "id": "3",
      "name": "Eggs",
      "quantity": "2 large"
    },
    {
      "id": "4",
      "name": "Parmesan cheese",
      "quantity": "50g"
    },
    {
      "id": "5",
      "name": "Olive oil",
      "quantity": "1 tbsp"
    },
    {
      "id": "6",
      "name": "Salt and freshly ground black pepper",
      "quantity": "to taste"
    }
  ],
  //instructions可以是html代码，用于控制简单的样式
  "instructions": `<ul>
    <li>Boil a large pot of salted water and cook spaghetti until al dente.</li>
    <li>Fry pancetta with olive oil until crispy.</li>
    <li>Beat eggs in a bowl, add grated Parmesan, and mix well.</li>
    <li>Drain pasta and add to pancetta, remove pan from heat.</li>
    <li>Quickly stir in the egg and cheese mixture to create a creamy sauce.</li>
    <li>Season with pepper and serve immediately.</li>
    </ul>`,

  "nutrition": {
    "Calories": "450 kcal per serving",
    "Protein": "18g",
    "Carbohydrates": "52g",
    "Fat": "18g"
  }
}
```