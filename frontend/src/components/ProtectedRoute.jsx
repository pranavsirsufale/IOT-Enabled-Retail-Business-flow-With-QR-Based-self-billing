import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/v1/me/", { credentials: "include" })
            .then((res) => {
                if (res.ok && !res.redirected && res.headers.get("content-type")?.includes("application/json")) {
                    return res.json();
                } else {
                    throw new Error("Not authenticated");
                }
            })
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                setUser(null);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return user ? <Outlet context={{ user }} /> : <Navigate to="/login" replace />;
}
