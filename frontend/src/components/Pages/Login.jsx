import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiUrl } from "../../api";

const ACCESS_TOKEN_KEY = "accessToken";

async function safeJson(res) {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) navigate("/dashboard", { replace: true });
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await fetch(apiUrl("/api/token/"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await safeJson(res);

            if (res.ok) {
                const access = data?.access;
                if (!access) throw new Error("Token response missing access token");
                localStorage.setItem(ACCESS_TOKEN_KEY, access);
                navigate("/dashboard", { replace: true });
            } else {
                const message =
                    data?.detail ||
                    data?.message ||
                    (Array.isArray(data?.non_field_errors) ? data.non_field_errors.join(" ") : "") ||
                    "Invalid username or password";
                setError(message);
            }
        } catch {
            setError("Unable to connect to server");
        } finally {
            setSubmitting(false);
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
                        {error ? (
                            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <div className="mt-1">
                                <input
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
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
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {submitting ? "Signing in…" : "Sign in"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}