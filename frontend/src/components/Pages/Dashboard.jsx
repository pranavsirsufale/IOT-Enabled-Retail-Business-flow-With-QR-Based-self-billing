import { useNavigate, useOutletContext } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useOutletContext();

  // Determine roles
  const isStoreManagerOrAdmin = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin";
  const isSecurityStaff = user?.role?.toLowerCase() === "security staff";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {isStoreManagerOrAdmin && (
              <>
                <div
                  onClick={() => navigate("/product")}
                  className="cursor-pointer bg-indigo-50 rounded-lg p-6 flex flex-col items-start gap-3 hover:shadow-md transition"
                >
                  <div className="text-4xl">📦</div>
                  <h2 className="text-lg font-semibold">Products</h2>
                  <p className="text-sm text-gray-600">Manage your products and inventory</p>
                </div>

                <div
                  onClick={() => navigate("/category-manager")}
                  className="cursor-pointer bg-green-50 rounded-lg p-6 flex flex-col items-start gap-3 hover:shadow-md transition"
                >
                  <div className="text-4xl">🗂️</div>
                  <h2 className="text-lg font-semibold">Category Manager</h2>
                  <p className="text-sm text-gray-600">Create and edit categories</p>
                </div>

                <div
                  onClick={() => navigate("/add-product")}
                  className="cursor-pointer bg-purple-50 rounded-lg p-6 flex flex-col items-start gap-3 hover:shadow-md transition"
                >
                  <div className="text-4xl">➕</div>
                  <h2 className="text-lg font-semibold">Add Product</h2>
                  <p className="text-sm text-gray-600">Quickly add a new product</p>
                </div>
              </>
            )}

            {(isSecurityStaff || isStoreManagerOrAdmin) && (
              <div
                onClick={() => navigate("/scan")}
                className="cursor-pointer bg-yellow-50 rounded-lg p-6 flex flex-col items-start gap-3 hover:shadow-md transition"
              >
                <div className="text-4xl">🔍</div>
                <h2 className="text-lg font-semibold">Scan SKU</h2>
                <p className="text-sm text-gray-600">Scan product QR and add to cart</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}