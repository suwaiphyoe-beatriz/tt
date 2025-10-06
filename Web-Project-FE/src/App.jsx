import React, { useState, useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./components/HomeManager/Home.jsx";
import NotFound from "./components/NotFound.jsx";
import Login from "./components/LoginManager/LogIn.jsx";
import Signin from "./components/LoginManager/SignIn.jsx";
import Recipes from "./components/RecipeManager/Recipes.jsx";
import RecipeDetail from './components/RecipeManager/RecipeDetail.jsx';
import FavoriteRecipes from './components/RecipeManager/FavoriteRecipes.jsx';
import AddRecipe from './components/RecipeManager/AddRecipe.jsx';
import Ingredient from './components/IngredientManager/Ingredient.jsx';
import About from './components/About.jsx';
import Cart from './components/CartManager/Cart.jsx';
import UserSettings from './components/UserSettings/UserSettings.jsx';
import EditRecipe from "./components/RecipeManager/EditReceipe.jsx";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signin" element={<Signin />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/:id" element={<RecipeDetail />} />
          <Route path="add-recipe" element={<AddRecipe />} />
          <Route path="/recipes/edit/:id" element={<EditRecipe />} />
          <Route path="favorites" element={<FavoriteRecipes />} />
          <Route path="ingredient/:id" element={<Ingredient />} />
          <Route path="cart" element={<Cart />} />
          <Route path="about" element={<About />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App
