import { useState, useEffect } from "react";

export default function CategoryManager() {
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  // Load categories
  const loadCategories = () => {
    fetch("/api/v1/category/")
      .then(res => res.json())
      .then(data => setCategories(data));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/v1/category/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ category: categoryName }),
    });

    if (res.ok) {
      alert("Category Added");
      setCategoryName("");
      loadCategories();
    } else {
      alert("Error adding category");
    }
  };

  // Add SubCategory
  const handleAddSubCategory = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/v1/sub-category/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        subCategory: subCategoryName,
        category: Number(selectedCategory),
      }),
    });

    if (res.ok) {
      alert("SubCategory Added");
      setSubCategoryName("");
    } else {
      alert("Error adding subcategory");
    }
  };

  return (
    <div className="flex justify-center py-16 bg-gray-100 min-h-screen">
      <div className="w-[450px] bg-white p-8 rounded-lg shadow-md">

        <h2 className="text-2xl font-semibold text-center mb-8">
          Category Manager
        </h2>

        {/* Add Category */}
        <form onSubmit={handleAddCategory} className="mb-8">
          <h3 className="font-medium mb-3">Add Category</h3>

          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Add Category
          </button>
        </form>

        <hr className="mb-8" />

        {/* Add SubCategory */}
        <form onSubmit={handleAddSubCategory}>
          <h3 className="font-medium mb-3">Add SubCategory</h3>

          <select
            className="w-full p-2 border rounded mb-4"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.category}
              </option>
            ))}
          </select>

          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="SubCategory Name"
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
            required
          />

          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Add SubCategory
          </button>
        </form>
      </div>
    </div>
  );
}