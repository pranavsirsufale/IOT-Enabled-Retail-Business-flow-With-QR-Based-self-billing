import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const isStoreManagerOrAdmin = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin";

  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (isStoreManagerOrAdmin) {
      fetch(`/api/v1/product/${id}/`)
        .then(res => res.json())
        .then(data => setProduct(data));
    }
  }, [id, isStoreManagerOrAdmin]);

  if (!isStoreManagerOrAdmin) {
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied. Store Managers and Admins only.</div>;
  }

  const handleUpdate = async (e) => {
    e.preventDefault();

    const getCookie = (name) => {
      const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return v ? v.pop() : '';
    };
    const csrf = getCookie('csrftoken');

    const res = await fetch(`/api/v1/product/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
      credentials: "include",
      body: JSON.stringify(product),
    });

    if (res.ok) {
      navigate("/product");
    } else {
      const d = await res.json();
      alert("Error: " + (d.detail || d.error || JSON.stringify(d)));
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>

          <form onSubmit={handleUpdate} className="space-y-4">
            <input
              className="w-full p-2 border rounded"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                className="w-full p-2 border rounded"
                value={product.stock}
                onChange={(e) => setProduct({ ...product, stock: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}