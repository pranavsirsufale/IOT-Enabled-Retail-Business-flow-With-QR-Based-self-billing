import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

export default function QRScanner() {
    const { user } = useOutletContext();
    const isAllowed = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "security staff";

    const videoRef = useRef(null);
    const [message, setMessage] = useState("Init camera...");
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (!isAllowed) return;

        let stream = null;
        let detector = null;
        let rafId = null;

        async function start() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                // Prefer BarcodeDetector if available
                if (window.BarcodeDetector) {
                    detector = new window.BarcodeDetector({ formats: ["qr_code"] });

                    const run = async () => {
                        try {
                            const results = await detector.detect(videoRef.current);
                            if (results && results.length) {
                                const raw = results[0].rawValue;
                                handleDecoded(raw);
                                return; // stop after first
                            }
                        } catch (e) {
                            // ignore frame errors
                        }
                        rafId = requestAnimationFrame(run);
                    };

                    setScanning(true);
                    run();
                } else {
                    setMessage("Barcode Detector API not supported in this browser. Use manual SKU input below.");
                }
            } catch (err) {
                setMessage("Unable to access camera: " + err.message);
            }
        }

        start();

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
            }
        };
    }, [isAllowed]);

    if (!isAllowed) {
        return <div className="p-8 text-center text-red-600 font-bold">Access Denied.</div>;
    }

    const handleDecoded = async (raw) => {
        setMessage(`Scanned: ${raw}`);
        // treat raw as SKU, try to find product
        try {
            const res = await fetch("/api/v1/product/");
            const products = await res.json();
            const found = products.find((p) => String(p.sku) === String(raw));
            if (found) {
                addToCart(found);
                setMessage(`Added ${found.name} to cart`);
            } else {
                setMessage("Product with scanned SKU not found");
            }
        } catch (e) {
            setMessage("Error fetching products: " + e.message);
        }
    };

    const addToCart = (product) => {
        const key = "cart";
        const raw = localStorage.getItem(key);
        let cart = raw ? JSON.parse(raw) : [];
        const idx = cart.findIndex((c) => c.id === product.id);
        if (idx >= 0) {
            cart[idx].qty += 1;
        } else {
            cart.push({ id: product.id, sku: product.sku, name: product.name, price: product.price, qty: 1 });
        }
        localStorage.setItem(key, JSON.stringify(cart));

        // Sync with server session
        try {
            const getCookie = (name) => {
                const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
                return v ? v.pop() : '';
            };
            const csrf = getCookie('csrftoken');
            fetch('/api/v1/cart/save/', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
                body: JSON.stringify({ items: cart })
            }).catch(() => { });
        } catch (e) {
            // ignore
        }
    };

    // fallback manual SKU input
    const [manualSku, setManualSku] = useState("");
    const handleManual = async (e) => {
        e.preventDefault();
        await handleDecoded(manualSku);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Scan QR to add product to cart</h2>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-black rounded overflow-hidden">
                            <video ref={videoRef} className="w-full h-64 object-cover" muted playsInline />
                        </div>

                        <div className="text-sm text-gray-600">{message}</div>

                        <form onSubmit={handleManual} className="flex gap-2">
                            <input value={manualSku} onChange={(e) => setManualSku(e.target.value)} placeholder="Enter SKU manually" className="flex-1 p-2 border rounded" />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
