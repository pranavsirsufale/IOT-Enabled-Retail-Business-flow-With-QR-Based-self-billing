import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { apiFetch } from "../../api";

export default function Cart() {
    const { user } = useOutletContext();
    const isAllowed = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "staff member";

    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [processingPayment, setProcessingPayment] = useState(false);
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [receiptData, setReceiptData] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // Poll server for cart updates (Scanner Integration)
    useEffect(() => {
        if (!isAllowed) return;

        const fetchCart = async () => {
            try {
                const res = await apiFetch('/api/v1/cart/');
                if (!res.ok) throw new Error(res.status);

                const data = await res.json();
                if (data && Array.isArray(data.cart)) {
                    setCart(data.cart);
                    localStorage.setItem('cart', JSON.stringify(data.cart));
                } else if (data && Array.isArray(data.items)) {
                    setCart(data.items);
                    localStorage.setItem('cart', JSON.stringify(data.items));
                }
            } catch (e) {
                console.error("Cart sync error", e);
            }
        };

        fetchCart();

        // Connect to WebSocket for instant updates
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

        let wsUrl;
        if (import.meta.env.DEV) {
            // Connect directly to the port where Django Daphne is running (8000), not the Vite dev server (5173/etc)
            wsUrl = `ws://localhost:8000/ws/cart/`;
        } else if (import.meta.env.VITE_API_URL) {
            const backend = new URL(import.meta.env.VITE_API_URL);
            const backendWsProto = backend.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${backendWsProto}//${backend.host}/ws/cart/`;
        } else {
            // Fallback: assume backend is hosted with the frontend
            wsUrl = `${protocol}//${window.location.host}/ws/cart/`;
        }

        const ws = new WebSocket(wsUrl);

        ws.onmessage = function (event) {
            try {
                const wsData = JSON.parse(event.data);
                if (wsData.action === 'update') {
                    // Re-fetch the cart when notified by websocket
                    fetchCart();
                }
            } catch (err) {
                console.error("Error parsing websocket message", err);
            }
        };

        ws.onclose = function (event) {
            console.log('Cart WebSocket disconnected.');
        };

        return () => {
            if (ws) ws.close();
        };
    }, [isAllowed]);

    // Receipt Component for Printing
    const Receipt = ({ data }) => {
        if (!data) return null;
        return (
            <div id="printable-receipt" className="hidden print:block p-4 font-mono text-sm w-[300px]">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">SMART STORE</h2>
                    <p>IOT Retail Street</p>
                    <p>Chh.Sambhaji Nagar MH 431001</p>
                    <p>Phone: +91 8308822538</p>
                </div>
                <div className="border-b-2 border-dashed border-gray-400 my-2"></div>
                <div className="flex justify-between">
                    <span>Date: {data.date}</span>
                </div>
                <div>ID: {data.cartId}</div>
                <div className="border-b-2 border-dashed border-gray-400 my-2"></div>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th className="text-center">Qty</th>
                            <th className="text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, i) => (
                            <tr key={i}>
                                <td>{item.name}</td>
                                <td className="text-center">{item.qty}</td>
                                <td className="text-right">₹{(item.price * item.qty).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="border-b-2 border-dashed border-gray-400 my-2"></div>
                <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL</span>
                    <span>₹{data.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                    <span>Payment: {data.method}</span>
                </div>
                <div className="border-b-2 border-dashed border-gray-400 my-2"></div>
                <div className="text-center mt-4">
                    <p>Thank you for shopping!</p>
                    <p>Visit Again</p>
                </div>
            </div>
        );
    };


    if (!isAllowed) {
        return <div className="p-8 text-center text-red-600 font-bold">Access Denied.</div>;
    }

    const save = (newCart) => {
        localStorage.setItem("cart", JSON.stringify(newCart));
        setCart(newCart);
        try {
            apiFetch('/api/v1/cart/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: newCart })
            }).catch(() => { });
        } catch (e) {
            // ignore
        }
    };

    const updateQty = (id, delta) => {
        const copy = cart.map((c) => {
            if (c.id === id) {
                return { ...c, qty: Math.max(0, c.qty + delta) };
            }
            return c;
        }).filter(c => c.qty > 0);
        save(copy);
    };

    const remove = (id) => {
        const copy = cart.filter((c) => c.id !== id);
        save(copy);
    };

    const total = cart.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);

    const initiateCheckout = () => {
        setError(null);
        setPaymentSuccess(false);
        if (!cart.length) return setError('Cart is empty');
        setShowPaymentModal(true);
    };

    const processPaymentAndCheckout = async () => {
        setProcessingPayment(true);
        // Simulate payment processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        await handleActualTransaction();
        setProcessingPayment(false);
    };

    const handleActualTransaction = async () => {
        setLoadingCheckout(true);
        try {
            const res = await apiFetch('/api/v1/transactions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart })
            });

            if (res.ok) {
                const resp = await res.json();
                const cartId = resp.cart_id || resp.cart || 'N/A';

                // Prepare receipt data
                const receipt = {
                    date: new Date().toLocaleString(),
                    cartId: cartId,
                    items: [...cart],
                    total: total,
                    method: paymentMethod.toUpperCase()
                };
                setReceiptData(receipt);
                setPaymentSuccess(true);

                // Clear cart locally
                localStorage.removeItem('cart');
                setCart([]);

            } else {
                const contentType = res.headers.get("content-type");
                let errorMsg = "Transaction failed";
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    errorMsg = data.error || data.detail || errorMsg;
                }
                setError(errorMsg);
            }
        } catch (e) {
            setError('Network error: ' + e.message);
        } finally {
            setLoadingCheckout(false);
        }
    };

    const handlePrintAndClose = () => {
        if (!receiptData || isPrinting) return;
        setIsPrinting(true);
    };

    // Print flow: ensure receipt stays mounted/visible for print preview.
    useEffect(() => {
        if (!isPrinting) return;

        const onAfterPrint = () => {
            setIsPrinting(false);
            setShowPaymentModal(false);
            setReceiptData(null);
            setPaymentSuccess(false);
            setError(null);
        };

        window.addEventListener("afterprint", onAfterPrint);

        // Let React commit DOM updates before opening the print dialog.
        const rafId = window.requestAnimationFrame(() => {
            window.print();
        });

        return () => {
            window.removeEventListener("afterprint", onAfterPrint);
            window.cancelAnimationFrame(rafId);
        };
    }, [isPrinting]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            <style>{`
                @media print {
                    @page { margin: 10mm; }
                    body { background: white !important; }

                    /* Print ONLY the receipt */
                    body * { visibility: hidden !important; }
                    #printable-receipt, #printable-receipt * { visibility: visible !important; }
                    #printable-receipt {
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                }
            `}</style>

            {/* Header / Top Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-20 px-6 py-4 flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    🛒 Self Checkout
                </h1>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Scan items to add to cart</p>
                </div>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:hidden">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-white rounded-2xl shadow-sm p-8">
                        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Ready to Scan</h2>
                        <p className="text-gray-500 text-lg mb-8">Scan QR codes on items or use the manual entry.</p>
                        <button
                            onClick={() => navigate('/product')}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-1"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                        {/* Left: Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="font-semibold text-gray-700">Current Order ({cart.length} items)</h2>
                                    <button onClick={() => save([])} className="text-red-500 text-sm hover:underline">Clear All</button>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                                    {cart.map((item) => (
                                        <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-xl font-bold text-gray-500">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                                                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                                    <button onClick={() => updateQty(item.id, -1)} className="p-2 hover:bg-white rounded-md transition shadow-sm">-</button>
                                                    <span className="w-8 text-center font-bold">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="p-2 hover:bg-white rounded-md transition shadow-sm">+</button>
                                                </div>
                                                <div className="text-right min-w-[80px]">
                                                    <p className="font-bold text-lg text-indigo-600">₹{(item.price * item.qty).toFixed(2)}</p>
                                                    <p className="text-xs text-gray-400">₹{item.price} each</p>
                                                </div>
                                                <button onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-500 p-2">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary & Checkout */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-indigo-50 p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (0%)</span>
                                        <span>₹0.00</span>
                                    </div>
                                    <div className="border-t border-dashed border-gray-200 my-2"></div>
                                    <div className="flex justify-between text-2xl font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={initiateCheckout}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition flex items-center justify-center gap-2"
                                >
                                    Proceed to Pay ₹{total.toFixed(2)}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Hidden Receipt Component - ONLY Visible when Printing */}
            <Receipt data={receiptData} />


            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity print:hidden">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">

                        {!paymentSuccess ? (
                            <>
                                <div className="bg-indigo-600 p-6 text-white text-center">
                                    <h3 className="text-2xl font-bold">Checkout</h3>
                                    <p className="opacity-80">Complete your purchase</p>
                                </div>
                                <div className="p-6">
                                    <div className="text-center mb-6">
                                        <p className="text-gray-500 text-sm uppercase tracking-wide">Amount Due</p>
                                        <p className="text-4xl font-bold text-gray-900">₹{total.toFixed(2)}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <span className="text-2xl">💵</span>
                                            <span className="font-semibold">Cash</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('upi')}
                                            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ${paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <span className="text-2xl">📱</span>
                                            <span className="font-semibold">UPI / QR</span>
                                        </button>
                                    </div>

                                    {paymentMethod === 'upi' && (
                                        <div className="bg-gray-100 p-4 rounded-lg mb-6 flex items-center justify-center">
                                            {/* Simulated QR Code */}
                                            <div className="w-32 h-32 bg-white p-2">
                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=store@upi&pn=SmartStore" alt="Pay QR" />
                                            </div>
                                            <div className="ml-4 text-left">
                                                <p className="font-bold text-gray-800">Scan to Pay</p>
                                                <p className="text-xs text-gray-500">Use any UPI app</p>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowPaymentModal(false)}
                                            className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                                            disabled={processingPayment}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={processPaymentAndCheckout}
                                            disabled={processingPayment}
                                            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-md hover:bg-green-700 disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            {processingPayment ? (
                                                <>Processing...</>
                                            ) : (
                                                <>Pay Now</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                                <p className="text-gray-500 mb-6">Your transaction has been recorded.</p>
                                <button
                                    onClick={handlePrintAndClose}
                                    disabled={isPrinting}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                    {isPrinting ? "Opening print…" : "Print Receipt & Finish"}
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
