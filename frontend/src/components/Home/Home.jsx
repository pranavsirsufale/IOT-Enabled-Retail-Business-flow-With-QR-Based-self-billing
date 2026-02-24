import React from "react";
import { Link, useOutletContext } from 'react-router-dom';

export default function Home() {
    // If we're rendered inside the Layout that provides context
    const { user } = useOutletContext() || {};

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-white flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-white">
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pb-16">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                        Smart Shopping Reimagined
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                        Experience the future of retail with our IoT-enabled self-billing system. Effortless shopping—just scan, pay, and go.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    to="/login"
                                    className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/login"
                                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600"
                                >
                                    Login <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative background visual (CSS Shapes) */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl opacity-30"
                >
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
            </div>

            {/* Feature Icons Strip - Compact */}
            <div className="bg-gray-50 py-8 border-t border-gray-100">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-3xl">📱</div>
                            <div className="text-sm font-medium text-gray-500">Scan & Pay</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-3xl">🛒</div>
                            <div className="text-sm font-medium text-gray-500">Cart Manage</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-3xl">⚡</div>
                            <div className="text-sm font-medium text-gray-500">Fast Checkout</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-3xl">🔒</div>
                            <div className="text-sm font-medium text-gray-500">Secure</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
