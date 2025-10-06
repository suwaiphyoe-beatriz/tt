

# 食材
## name
Chicken Breast

## image
正方形的图，png或jpg格式

## url
```jsx
"url": {
    "K-market": "http://xxxxxx"
    "S-market": "http://xxxxxx"
    "Lidl": "http://xxxxxx"
  }
```
## price
12.99
6.99

## unit
kg
kpl
500g

## description
Fresh organic chicken breast, perfect for grilling, baking, or stir-frying. Our chickens are raised without antibiotics and hormones, ensuring the highest quality and taste. Rich in protein and low in fat, making it an excellent choice for healthy meals.


## nutrition
可以任意多条，但不要太多，保持4~6个。格式如下。这是每100g的含量。
```json
 "nutrition": {
    "Calories": "165kcal per 100g",
    "Protein": "31g",
    "Fat": "3.6g",
    "Carbs": "0g"
  },
```



## Additional Information
### should be html format, for example:
```html
<p><strong>Storage Instructions:</strong> Keep refrigerated at 0-4°C. Use within 2-3 days of purchase for best quality.</p>

<p><strong>Cooking Tips:</strong></p>
<ul>
  <li>For grilling: Cook at medium-high heat for 6-8 minutes per side</li>
  <li>For baking: Preheat oven to 375°F and bake for 20-25 minutes</li>
  <li>Internal temperature should reach 165°F (74°C)</li>
  <li>Let rest for 3-5 minutes before slicing</li>
</ul>

<p><strong>Origin:</strong> Locally sourced from certified organic farms within 100 miles of our store.</p>
```

```html
<p>这里是段落</p>
<p><strong>这里是加粗</strong></p>
<ul>
  <li>第一条</li>
  <li>第二条</li>
</ul>
```



# 在数据库中
```jsx
{
  "id": 1,
  "name": "Chicken Breast",
  "price": 12.99,
  "unit": "kg",
  "image": "",
  "url": {
    "K-market": "http://xxxxxx"
    "S-market": "http://xxxxxx"
    "Lidl": "http://xxxxxx"
  }
  "description": "Fresh organic chicken breast, perfect for grilling, baking, or stir-frying. Our chickens are raised without antibiotics and hormones, ensuring the highest quality and taste. Rich in protein and low in fat, making it an excellent choice for healthy meals.",
  "nutrition": {
    "Calories": "165kcal per 100g",
    "Protein": "31g per 100g",
    "Fat": "3.6g per 100g",
    "Carbs": "0g per 100g"
  },
  "additionalInfo": `
    <p><strong>Storage Instructions:</strong> Keep refrigerated at 0-4°C. Use within 2-3 days...</p>
    <p><strong>Cooking Tips:</strong></p>
    <ul>
      <li>For grilling: Cook at medium-high heat for 6-8 minutes per side</li>
      <li>For baking: Preheat oven to 375°F and bake for 20-25 minutes</li>
      <li>Internal temperature should reach 165°F (74°C)</li>
      <li>Let rest for 3-5 minutes before slicing</li>
    </ul>
    <p><strong>Origin:</strong> Locally sourced from certified organic farms...</p>
  `
}
```