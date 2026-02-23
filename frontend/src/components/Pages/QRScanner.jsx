import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function QRScanner() {
    const { user } = useOutletContext();
    const isAllowed = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "security staff";

    const [message, setMessage] = useState("Init camera...");
    const [scanning, setScanning] = useState(false);
    const [lastScanned, setLastScanned] = useState({ text: null, time: 0 });

    const playBeep = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz beep
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1); // 100ms duration
    };

    useEffect(() => {
        if (!isAllowed) return;

        let html5QrCode;
        let isMounted = true;

        async function start() {
            try {
                html5QrCode = new Html5Qrcode("qr-reader");
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 30, // Increased FPS for faster scanning
                        qrbox: { width: 250, height: 250 },
                        formatsToSupport: [
                            Html5QrcodeSupportedFormats.QR_CODE,
                            Html5QrcodeSupportedFormats.UPC_A,
                            Html5QrcodeSupportedFormats.UPC_E,
                            Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
                            Html5QrcodeSupportedFormats.EAN_8,
                            Html5QrcodeSupportedFormats.EAN_13,
                            Html5QrcodeSupportedFormats.CODE_39,
                            Html5QrcodeSupportedFormats.CODE_93,
                            Html5QrcodeSupportedFormats.CODE_128,
                            Html5QrcodeSupportedFormats.ITF,
                            Html5QrcodeSupportedFormats.CODABAR
                        ]
                    },
                    (decodedText, decodedResult) => {
                        // handle success
                        if (isMounted) {
                            const now = Date.now();
                            // Prevent duplicate scans within 2 seconds
                            setLastScanned(prev => {
                                if (prev.text === decodedText && now - prev.time < 2000) {
                                    return prev;
                                }
                                playBeep();
                                handleDecoded(decodedText);
                                return { text: decodedText, time: now };
                            });
                        }
                    },
                    (errorMessage) => {
                        // parse error, ignore
                    }
                );
                if (isMounted) {
                    setScanning(true);
                    setMessage("Scanning...");
                } else {
                    // If unmounted while starting, stop it
                    html5QrCode.stop().catch(console.error);
                }
            } catch (err) {
                if (isMounted) {
                    setMessage("Unable to access camera: " + err);
                }
            }
        }

        start();

        return () => {
            isMounted = false;
            if (html5QrCode && html5QrCode.isScanning) {
                try {
                    html5QrCode.stop().catch(err => console.error("Failed to stop scanner", err));
                } catch (e) {
                    console.error(e);
                }
            }
        };
    }, [isAllowed]);

    if (!isAllowed) {
        return <div className="p-8 text-center text-red-600 font-bold">Access Denied.</div>;
    }

    async function handleDecoded(raw) {
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
    }

    function addToCart(product) {
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
    }

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
                    <h2 className="text-xl font-semibold mb-4">Scan QR or Barcode to add product to cart</h2>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-black rounded overflow-hidden" id="qr-reader" style={{ width: "100%" }}>
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
