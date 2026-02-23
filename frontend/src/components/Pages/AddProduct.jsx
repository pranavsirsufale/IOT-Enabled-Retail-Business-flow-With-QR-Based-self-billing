import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function AddProduct() {
  const { user } = useOutletContext();
  const isStoreManagerOrAdmin = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin";

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
    if (isStoreManagerOrAdmin) {
      fetch("/api/v1/category/")
        .then(res => res.json())
        .then(data => setCategories(data));
    }
  }, [isStoreManagerOrAdmin]);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory && isStoreManagerOrAdmin) {
      fetch("/api/v1/sub-category/")
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(
            sub => sub.category === Number(selectedCategory)
          );
          setSubCategories(filtered);
        });
    }
  }, [selectedCategory, isStoreManagerOrAdmin]);

  if (!isStoreManagerOrAdmin) {
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied. Store Managers and Admins only.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const getCookie = (name) => {
      const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return v ? v.pop() : '';
    };
    const csrf = getCookie('csrftoken');

    const res = await fetch("/api/v1/product/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
      credentials: "include",
      body: JSON.stringify({
        sku,
        name,
        stock: Number(stock),
        price: Number(price),
        subCategory: Number(selectedSubCategory),
      }),
    });

    if (res.ok) {
      alert("Product Added");
      setSku("");
      setName("");
      setStock("");
      setPrice("");
    } else {
      const d = await res.json();
      alert("Error: " + (d.detail || d.error || JSON.stringify(d)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Add Product</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                className="w-full p-2 border rounded"
                placeholder="SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />

              <input
                className="w-full p-2 border rounded"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />

              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                className="w-full p-2 border rounded"
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

              <select
                className="w-full p-2 border rounded"
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
            </div>

            <div className="flex justify-end">
              <button className="bg-blue-600 text-white py-2 px-4 rounded">Add Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}