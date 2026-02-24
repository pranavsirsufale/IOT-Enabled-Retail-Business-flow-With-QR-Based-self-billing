import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const isStoreManagerOrAdmin = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const qrRef = useRef(null);

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
    setLoading(true);

    const getCookie = (name) => {
      const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return v ? v.pop() : '';
    };
    const csrf = getCookie('csrftoken');

    try {
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
    } catch (error) {
      console.error("Error updating product:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `${product.sku || 'product'}_QR.png`;
    link.click();
  };

  if (!product) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Edit Product</h3>
          <button
            onClick={() => navigate('/product')}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
          >
            &larr; Back to List
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main Form Section - Takes up 2/3 of space on desktop */}
          <div className="md:col-span-2">
            <div className="shadow sm:rounded-md bg-white">
              <div className="px-4 py-5 bg-white sm:p-6">
                <form onSubmit={handleUpdate} className="grid grid-cols-6 gap-6">

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                      type="text"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                      value={product.name}
                      onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    />
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700">SKU (Read Only)</label>
                    <input
                      type="text"
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border bg-gray-100 text-gray-500 cursor-not-allowed"
                      value={product.sku || ''}
                      readOnly
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                    <input
                      type="number"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                      value={product.stock}
                      onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input
                      type="number"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: e.target.value })}
                    />
                  </div>

                </form>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 mt-4 -mx-6 -mb-6">
                  <button
                    onClick={handleUpdate}
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section - Takes up 1/3 of space on desktop */}
          <div className="shadow sm:rounded-lg bg-white p-6 h-full flex flex-col justify-between">
            {product.sku ? (
              <div className="bg-white shadow sm:rounded-lg overflow-hidden sticky top-6">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">QR Code</h3>
                </div>
                <div className="p-6 flex flex-col items-center">
                  <div ref={qrRef} className="bg-white p-2 inline-block border rounded">
                    <QRCodeCanvas value={product.sku} size={180} includeMargin={true} />
                    <div className="text-center mt-2 font-mono text-sm font-bold text-gray-700">{product.sku}</div>
                  </div>
                  <button
                    type="button"
                    onClick={downloadQR}
                    className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download QR
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow sm:rounded-lg p-6 text-center text-gray-500">
                <p>No SKU available for QR Code</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}