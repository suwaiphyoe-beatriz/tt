import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";

const EditRecipe = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  // Fetch recipe details
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipes/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load recipe");
        setFormData(data.data);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("nutrition.")) {
      const nutritionField = name.split(".")[1];
      setFormData({
        ...formData,
        nutrition: {
          ...formData.nutrition,
          [nutritionField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle image upload (convert to base64)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData({
        ...formData,
        image: reader.result, // base64 string
        imageFile: file,
      });
    };
    reader.readAsDataURL(file);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("authToken");

      // Remove imageFile before sending
      const submitData = { ...formData };
      delete submitData.imageFile;

      const res = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update recipe");

      alert("Recipe updated successfully!");
      navigate(`/recipes/${id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading recipe...</p>;
  if (!formData)
    return <p className="text-center py-10 text-red-500">Recipe not found.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6">Edit Recipe</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipe Image */}
        <div>
          <label className="block font-medium mb-1">Recipe Image</label>
          {formData.image && (
            <img
              src={formData.image}
              alt="Recipe"
              className="w-48 h-48 object-cover mb-2 rounded"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Recipe Title</label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows={4}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block font-medium mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country || ""}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Main Ingredient */}
        <div>
          <label className="block font-medium mb-1">Main Ingredient</label>
          <input
            type="text"
            name="mainIngredient"
            value={formData.mainIngredient || ""}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Cook Time */}
        <div>
          <label className="block font-medium mb-1">Cook Time</label>
          <input
            type="text"
            name="cookTime"
            value={formData.cookTime || ""}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block font-medium mb-1">Instructions</label>
          <textarea
            name="instructions"
            value={formData.instructions || ""}
            onChange={handleChange}
            rows={6}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Nutrition */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Nutrition Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Calories", "Protein", "Carbohydrates", "Fat"].map((nutrient) => (
              <div key={nutrient}>
                <label className="block font-medium mb-1">{nutrient}</label>
                <input
                  type="text"
                  name={`nutrition.${nutrient}`}
                  value={formData.nutrition?.[nutrient] || ""}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/recipes/${id}`)}
            className="flex-1 bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRecipe;
