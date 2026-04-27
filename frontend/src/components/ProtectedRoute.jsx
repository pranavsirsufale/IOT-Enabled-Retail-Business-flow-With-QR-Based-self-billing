import { Navigate, Outlet } from "react-router-dom";

const ACCESS_TOKEN_KEY = "accessToken";

export default function ProtectedRoute() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}
