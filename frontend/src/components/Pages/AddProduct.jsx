import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function AddProduct() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const isStoreManagerOrAdmin =
    user?.isAdmin ||
    user?.role?.toLowerCase() === "store manager" ||
    user?.role?.toLowerCase() === "admin";

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const qrRef = useRef(null);

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
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Access Denied. Store Managers and Admins only.
      </div>
    );
  }

  // Download QR Code
  const downloadQR = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `${sku}_QR.png`;
    link.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const getCookie = (name) => {
      const v = document.cookie.match(
        "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
      );
      return v ? v.pop() : "";
    };

    const csrf = getCookie("csrftoken");

    try {
      const res = await fetch("/api/v1/product/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
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
        alert("Product Added Successfully");
        setSku("");
        setName("");
        setStock("");
        setPrice("");
        setSelectedCategory("");
        setSelectedSubCategory("");
      } else {
        const d = await res.json();
        alert("Error: " + (d.detail || d.error || JSON.stringify(d)));
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="md:grid md:grid-cols-3 md:gap-6 mb-8">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">New Product</h3>
              <p className="mt-1 text-sm text-gray-600">
                Enter product details and generate a QR code for inventory tracking.
              </p>
              <button
                onClick={() => navigate('/product')}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
              >
                &larr; Back to List
              </button>
            </div>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="shadow overflow-hidden sm:rounded-md bg-white">
              <div className="px-4 py-5 bg-white sm:p-6">
                <form onSubmit={handleSubmit} className="grid grid-cols-6 gap-6">

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      required
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.category}</option>)}
                    </select>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Sub Category</label>
                    <select
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      required
                      disabled={!selectedCategory}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                    >
                      <option value="">Select Sub Category</option>
                      {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.subCategory}</option>)}
                    </select>
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700">SKU (Stock Keeping Unit)</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        required
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 border"
                      />
                      <button
                        type="button"
                        onClick={() => setSku(Math.random().toString(36).substring(2, 10).toUpperCase())}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>

                </form>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 mt-4 -mx-6 -mb-6">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {sku && name && (
          <div className="bg-white shadow sm:rounded-lg overflow-hidden mt-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Generated QR Code</h3>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div ref={qrRef} className="border p-4 bg-white inline-block">
                <QRCodeCanvas value={sku} size={200} includeMargin={true} />
                <div className="text-center mt-2 font-mono text-sm">{sku}</div>
                <div className="text-center text-xs text-gray-500">{name}</div>
              </div>
              <button
                onClick={downloadQR}
                className="mt-4 inline-flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download QR
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}