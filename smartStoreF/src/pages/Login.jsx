import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/button";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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
                navigate("/dashboard");
            } else {
                alert(data.detail || data.message || "Login failed");
            }
        } catch {
            alert("Unable to connect to server");
        }
    };

    return (
        <div className="h-screen bg-gray-100 flex items-center justify-center">            <form
            onSubmit={handleLogin}
            className="w-96 p-8 bg-white rounded-lg shadow-md"
        >
            <h2 className="text-2xl font-semibold text-center mb-6">
                Login
            </h2>

            <input
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-center">
                <Button type="primary">Login</Button>
            </div>
        </form>
        </div>
    );
}