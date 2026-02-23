import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { user } = useOutletContext();

  const isStoreManagerOrAdmin = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin";

  const fetchProducts = () => {
    fetch("/api/v1/product/")
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    if (isStoreManagerOrAdmin) {
      fetchProducts();
    }
  }, [isStoreManagerOrAdmin]);

  if (!isStoreManagerOrAdmin) {
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied. Store Managers and Admins only.</div>;
  }

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    const getCookie = (name) => {
      const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return v ? v.pop() : '';
    };
    const csrf = getCookie('csrftoken');

    await fetch(`/api/v1/product/${id}/`, {
      method: "DELETE",
      credentials: "include",
      headers: { "X-CSRFToken": csrf },
    });

    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Product List</h2>
            <button
              onClick={() => navigate("/add-product")}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.sku}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">₹{p.price}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => navigate(`/edit-product/${p.id}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}