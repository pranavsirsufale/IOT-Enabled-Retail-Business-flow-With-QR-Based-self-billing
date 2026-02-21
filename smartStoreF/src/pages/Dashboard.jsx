import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100 p-10">
            <h1 className="text-3xl font-bold mb-10 text-center">
                Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

                {/* Products Card */}
                <div
                    onClick={() => navigate("/products")}
                    className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition duration-300"
                >
                    <h2 className="text-xl font-semibold mb-2">Products</h2>
                    <p className="text-gray-600">
                        View, edit and manage all products.
                    </p>
                </div>

                {/* Category Manager Card */}
                <div
                    onClick={() => navigate("/category-manager")}
                    className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition duration-300"
                >
                    <h2 className="text-xl font-semibold mb-2">
                        Category Manager
                    </h2>
                    <p className="text-gray-600">
                        Add and organize product categories.
                    </p>
                </div>

                {/* Add Product Card */}
                <div
                    onClick={() => navigate("/add-product")}
                    className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition duration-300"
                >
                    <h2 className="text-xl font-semibold mb-2">
                        Add Product
                    </h2>
                    <p className="text-gray-600">
                        Create a new product entry.
                    </p>
                </div>

            </div>
        </div>
    );
}