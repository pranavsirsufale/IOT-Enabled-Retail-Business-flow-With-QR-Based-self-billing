import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { apiFetchJson, clearAccessToken, getAccessToken } from "../api";

export default function ProtectedRoute() {
    const token = getAccessToken();
    const outletContext = useOutletContext() || {};
    const setUser = outletContext.setUser;

    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [fetchedUser, setFetchedUser] = useState(null);

    useEffect(() => {
        let cancelled = false;

        if (!token) {
            setChecking(false);
            setAuthorized(false);
            return;
        }

        setChecking(true);
        (async () => {
            const { res, data } = await apiFetchJson("/api/v1/me/");
            if (cancelled) return;

            if (res.ok && data) {
                setFetchedUser(data);
                if (typeof setUser === "function") setUser(data);
                setAuthorized(true);
            } else {
                clearAccessToken();
                if (typeof setUser === "function") setUser(null);
                setAuthorized(false);
            }
        })()
            .catch(() => {
                if (cancelled) return;
                clearAccessToken();
                if (typeof setUser === "function") setUser(null);
                setAuthorized(false);
            })
            .finally(() => {
                if (cancelled) return;
                setChecking(false);
            });

        return () => {
            cancelled = true;
        };
    }, [token, setUser]);

    const mergedContext = useMemo(() => {
        return {
            ...outletContext,
            user: outletContext.user ?? fetchedUser,
            loading: Boolean(outletContext.loading) || checking,
        };
    }, [outletContext, fetchedUser, checking]);

    if (!token) return <Navigate to="/login" replace />;

    if (checking) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return authorized ? <Outlet context={mergedContext} /> : <Navigate to="/login" replace />;
}
