import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    return (
       <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-10">
    <h1 className="text-5xl font-bold mb-12 text-gray-800">Dashboard</h1>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Card 1 */}
        <div 
            onClick={() => navigate("/products")}
            className="cursor-pointer bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition p-8 flex flex-col items-center justify-center"
        >
            <div className="text-6xl mb-4 text-blue-600">📦</div>
            <h2 className="text-2xl font-semibold text-gray-800">Products</h2>
            <p className="text-gray-500 mt-2 text-center">Manage all your products</p>
        </div>

        {/* Card 2 */}
        <div 
            onClick={() => navigate("/category-manager")}
            className="cursor-pointer bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition p-8 flex flex-col items-center justify-center"
        >
            <div className="text-6xl mb-4 text-green-600">🗂️</div>
            <h2 className="text-2xl font-semibold text-gray-800">Category Manager</h2>
            <p className="text-gray-500 mt-2 text-center">Add or edit categories</p>
        </div>

        {/* Card 3 */}
        <div 
            onClick={() => navigate("/add-product")}
            className="cursor-pointer bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition p-8 flex flex-col items-center justify-center"
        >
            <div className="text-6xl mb-4 text-purple-600">➕</div>
            <h2 className="text-2xl font-semibold text-gray-800">Add Product</h2>
            <p className="text-gray-500 mt-2 text-center">Add new products quickly</p>
        </div>
    </div>
</div>
    );
}
