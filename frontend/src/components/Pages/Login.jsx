import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        // Check if user is already logged in
        fetch("/api/v1/me/", { credentials: "include" })
            .then((res) => {
                if (res.ok && !res.redirected && res.headers.get("content-type")?.includes("application/json")) {
                    // If logged in, redirect to dashboard
                    window.location.href = "/dashboard";
                }
            })
            .catch(() => {
                // Ignore errors, stay on login page
            });
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
                // Force a full page reload to update the Header state
                window.location.href = "/dashboard";
            } else {
                alert(data.detail || data.message || "Login failed");
            }
        } catch {
            alert("Unable to connect to server");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 flex items-start">
            <div className="max-w-md w-full mx-auto px-4">
                <div className="bg-white shadow rounded-lg p-8">
                    <h2 className="text-2xl font-semibold text-center mb-6">Sign in to your account</h2>

                    <form onSubmit={handleLogin}>
                        <label className="block text-sm text-gray-600 mb-1">Username</label>
                        <input
                            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <label className="block text-sm text-gray-600 mb-1">Password</label>
                        <input
                            className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Log In</button>
                    </form>
                </div>
            </div>
        </div>
    );
}