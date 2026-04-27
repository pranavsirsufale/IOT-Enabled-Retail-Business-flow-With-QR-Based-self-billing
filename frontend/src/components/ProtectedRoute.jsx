import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../api";

export default function ProtectedRoute() {
    const token = getAccessToken();
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}
