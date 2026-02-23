import React from "react";
import { Link } from 'react-router-dom'

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-5xl mx-auto px-4">
                <div className="bg-white shadow rounded-lg p-10">
                    <h1 className="text-3xl font-bold mb-4">Welcome to SmartStore</h1>
                    <p className="text-gray-600 mb-6">Manage your inventory, categories and store settings from a single admin dashboard.</p>

                    <div className="flex gap-3">
                        <Link to="/login" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Get started</Link>
                        <Link to="/product" className="border border-gray-200 px-4 py-2 rounded hover:bg-gray-50">Browse products</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

