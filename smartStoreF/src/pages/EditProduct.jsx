import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/v1/product/${id}/`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    await fetch(`/api/v1/product/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(product),
    });

    navigate("/products");
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="flex justify-center py-16">
      <form onSubmit={handleUpdate} className="w-96 bg-white p-8 shadow rounded">
        <h2 className="text-xl mb-4">Edit Product</h2>

        <input
          className="w-full mb-4 p-2 border"
          value={product.name}
          onChange={(e) =>
            setProduct({ ...product, name: e.target.value })
          }
        />
  <input
          className="w-full mb-4 p-2 border"
          value={product.stock}
          onChange={(e) =>
            setProduct({ ...product, stock: e.target.value })
          }
        />
        <input
          className="w-full mb-4 p-2 border"
          value={product.price}
          onChange={(e) =>
            setProduct({ ...product, price: e.target.value })
          }
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Update
        </button>
      </form>
    </div>
  );
}