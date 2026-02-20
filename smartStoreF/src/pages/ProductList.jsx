import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = () => {
    fetch("/api/v1/product/")
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`/api/v1/product/${id}/`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchProducts();
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-semibold mb-6">Product List</h2>

      <button
        onClick={() => navigate("/add-product")}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Add Product
      </button>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">SKU</th>
            <th>Name</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t text-center">
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>{p.stock}</td>
              <td>₹{p.price}</td>
              <td className="space-x-2">
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
  );
}