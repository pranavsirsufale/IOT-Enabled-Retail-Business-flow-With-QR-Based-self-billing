import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const { setUser } = useOutletContext() || {};
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        // Double check but the context check is better
        fetch("/api/v1/me/", { credentials: "include" })
            .then((res) => {
                if (res.ok && !res.redirected && res.headers.get("content-type")?.includes("application/json")) {
                    navigate("/dashboard", { replace: true });
                }
            })
            .catch(() => { });
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/v1/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Fetch user data immediately to update global state
                try {
                    const meRes = await fetch("/api/v1/me/", { credentials: "include" });
                    if (meRes.ok) {
                        const userData = await meRes.json();
                        if (setUser) setUser(userData);
                    }
                } catch (e) {
                    console.error("Failed to fetch user after login", e);
                }
                navigate("/dashboard", { replace: true });
            } else {
                alert(data.detail || data.message || "Login failed");
            }
        } catch {
            alert("Unable to connect to server");
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-white flex items-center justify-center">
            <div className="max-w-md w-full mx-auto px-4">
                <div className="bg-white shadow-xl rounded-lg p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <div className="mt-1">
                                <input
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}