import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={() => navigate("/products")}>
                products
            </button>
            <button onClick={() => navigate("/category-manager")}>
                category manager
            </button>
            <button onClick={() => navigate("/add-product")}>
                add product
            </button>
        </div>
    );
}
