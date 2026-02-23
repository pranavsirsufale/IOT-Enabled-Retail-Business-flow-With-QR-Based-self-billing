import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function CategoryManager() {
  const { user } = useOutletContext();
  const isStoreManagerOrAdmin = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin";

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
    if (isStoreManagerOrAdmin) {
      loadCategories();
    }
  }, [isStoreManagerOrAdmin]);

  if (!isStoreManagerOrAdmin) {
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied. Store Managers and Admins only.</div>;
  }

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    const getCookie = (name) => {
      const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return v ? v.pop() : '';
    };
    const csrf = getCookie('csrftoken');

    const res = await fetch("/api/v1/category/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
      credentials: "include",
      body: JSON.stringify({ category: categoryName }),
    });

    if (res.ok) {
      alert("Category Added");
      setCategoryName("");
      loadCategories();
    } else {
      const d = await res.json();
      alert("Error: " + (d.detail || d.error || JSON.stringify(d)));
    }
  };

  // Add SubCategory
  const handleAddSubCategory = async (e) => {
    e.preventDefault();

    const getCookie = (name) => {
      const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return v ? v.pop() : '';
    };
    const csrf = getCookie('csrftoken');

    const res = await fetch("/api/v1/sub-category/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
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
      const d = await res.json();
      alert("Error: " + (d.detail || d.error || JSON.stringify(d)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Category Manager</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleAddCategory} className="space-y-3">
              <h3 className="font-medium">Add Category</h3>
              <input
                className="w-full p-2 border rounded"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add Category</button>
            </form>

            <form onSubmit={handleAddSubCategory} className="space-y-3">
              <h3 className="font-medium">Add SubCategory</h3>
              <select
                className="w-full p-2 border rounded"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.category}</option>
                ))}
              </select>

              <input
                className="w-full p-2 border rounded"
                placeholder="SubCategory Name"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                required
              />

              <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Add SubCategory</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}