import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { getAccessToken } from "../api";

export default function ProtectedRoute() {
    const token = getAccessToken();
    const outletContext = useOutletContext();
    return token ? <Outlet context={outletContext} /> : <Navigate to="/login" replace />;
}
