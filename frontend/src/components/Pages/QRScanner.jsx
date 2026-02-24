import { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function QRScanner() {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const isAllowed = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "staff member";

    const [message, setMessage] = useState("Init camera...");
    const [scanning, setScanning] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const lastScannedRef = useRef({ text: null, time: 0 });

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
        const raw = localStorage.getItem("cart");
        if (raw) {
            setCartItems(JSON.parse(raw));
        }
    }, []);

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
                        qrbox: { width: 350, height: 250 },
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
                            const prev = lastScannedRef.current;
                            // Prevent duplicate scans within 3 seconds
                            if (prev.text === decodedText && now - prev.time < 3000) {
                                return;
                            }

                            lastScannedRef.current = { text: decodedText, time: now };
                            playBeep();
                            handleDecoded(decodedText);
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
        setCartItems(cart);
        localStorage.setItem(key, JSON.stringify(cart));

        // Sync with server session
        try {
            const getCookie = (name) => {
                const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
                return v ? v.pop() : '';
            };
            const csrf = getCookie('csrftoken');
            fetch('/api/v1/cart/', {
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
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Scan & Shop
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Point your camera at a product QR code to add it to your cart.
                    </p>
                </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Scanner */}
                        <div className="space-y-6">
                            <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl relative aspect-square lg:aspect-video flex items-center justify-center">
                                <div id="qr-reader" className="w-full h-full"></div>
                                {scanning && (
                                    <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-2xl">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-64 h-64 border-2 border-green-500 rounded-lg relative animate-pulse">
                                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1"></div>
                                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1"></div>
                                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1"></div>
                                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1"></div>
                                            </div>
                                        </div>
                                        <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium bg-black/50 py-1">
                                            Point camera at a QR code
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Manual Entry */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Trouble scanning?</label>
                                <form onSubmit={handleManual} className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={manualSku} 
                                        onChange={(e) => setManualSku(e.target.value)} 
                                        placeholder="Enter SKU manually" 
                                        className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    />
                                    <button 
                                        type="submit"
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                    >
                                        Add
                                    </button>
                                </form>
                            </div>
                            
                            {/* Status Message */}
                            {message && (
                                <div className={`p-4 mb-4 text-sm rounded-lg ${message.includes('Added') ? 'text-green-800 bg-green-50' : 'text-blue-800 bg-blue-50'}`} role="alert">
                                    <span className="font-medium">Status:</span> {message}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Cart Summary */}
                        <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    Current Cart
                                </h3>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    {cartItems.reduce((a, c) => a + c.qty, 0)} Items
                                </span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
                                {cartItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                        <p>Your cart is empty</p>
                                        <p className="text-sm">Scan items to start shopping</p>
                                    </div>
                                ) : (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
                                                    {item.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                                    <p className="text-xs text-gray-500">
                                                        ₹{item.price} × {item.qty}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate('/cart')}
                                    disabled={cartItems.length === 0}
                                    className={`w-full py-3.5 px-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                                        cartItems.length === 0 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30'
                                    }`}
                                >
                                    Proceed to Checkout
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>

            </div >
        </div >
    );
}