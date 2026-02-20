import { useState, useEffect } from "react";

export default function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");

  // Load categories
  useEffect(() => {
    fetch("/api/v1/category/")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetch("/api/v1/sub-category/")
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(
            sub => sub.category === Number(selectedCategory)
          );
          setSubCategories(filtered);
        });
    }
  }, [selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("/api/v1/product/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        sku,
        name,
        stock: Number(stock),
        price: Number(price),
        subCategory: Number(selectedSubCategory),
      }),
    });

    alert("Product Added");
  };

  return (
    <div className="flex justify-center py-16 bg-gray-100">
      <form className="w-96 bg-white p-8 shadow rounded" onSubmit={handleSubmit}>
        <h2 className="text-xl mb-4 text-center">Add Product</h2>

        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />

        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />

        <input
          type="number"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        {/* Category Dropdown */}
        <select
          className="w-full mb-4 p-2 border rounded"
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

        {/* SubCategory Dropdown */}
        <select
          className="w-full mb-6 p-2 border rounded"
          value={selectedSubCategory}
          onChange={(e) => setSelectedSubCategory(e.target.value)}
          required
        >
          <option value="">Select SubCategory</option>
          {subCategories.map(sub => (
            <option key={sub.id} value={sub.id}>
              {sub.subCategory}
            </option>
          ))}
        </select>

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Add Product
        </button>
      </form>
    </div>
  );
}