import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

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
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAllowed) return;

        const raw = localStorage.getItem("cart");
        setCart(raw ? JSON.parse(raw) : []);
        // If localStorage is empty, try to load server-side draft cart
        if (!raw) {
            fetch('/api/v1/cart/', { credentials: 'include' })
                .then((r) => r.json())
                .then((d) => {
                    if (d && Array.isArray(d.items) && d.items.length) {
                        localStorage.setItem('cart', JSON.stringify(d.items));
                        setCart(d.items);
                    }
                })
                .catch(() => { });
        }
    }, [isAllowed]);

    if (!isAllowed) {
        return <div className="p-8 text-center text-red-600 font-bold">Access Denied.</div>;
    }

    const save = (newCart) => {
        localStorage.setItem("cart", JSON.stringify(newCart));
        setCart(newCart);
        // Persist draft cart to server session (does not checkout)
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
                body: JSON.stringify({ items: newCart })
            }).catch(() => { });
        } catch (e) {
            // ignore
        }
    };

    const inc = (id) => {
        const copy = cart.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
        save(copy);
    };

    const dec = (id) => {
        const copy = cart
            .map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c))
            .filter((c) => c.qty > 0);
        save(copy);
    };

    const remove = (id) => {
        const copy = cart.filter((c) => c.id !== id);
        save(copy);
    };

    const total = cart.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);

    const initiateCheckout = () => {
        setError(null);
        if (!cart.length) return setError('Cart is empty');
        setShowPaymentModal(true);
    };

    const processPaymentAndCheckout = async () => {
        setProcessingPayment(true);

        // Open window immediately to bypass popup blocker
        let printWindow = null;
        try {
            printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Processing</title></head><body><div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h2>Processing Payment... Please wait. Do not close this window.</h2></div></body></html>');
            }
        } catch (e) {
            console.error("Popup blocked", e);
        }

        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        await handleActualTransaction(printWindow);
        setProcessingPayment(false);
        setShowPaymentModal(false);
    };

    const handleActualTransaction = async (printWindow) => {
        setLoadingCheckout(true);
        try {
            // verify session
            const me = await fetch('/api/v1/me/', { credentials: 'include' });
            if (!me.ok) {
                setLoadingCheckout(false);
                setError('You must be logged in to checkout');
                if (printWindow) printWindow.close();
                return;
            }

            // Read CSRF token from cookie
            const getCookie = (name) => {
                const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
                return v ? v.pop() : '';
            };
            const csrf = getCookie('csrftoken');

            const res = await fetch('/api/v1/transactions/', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
                body: JSON.stringify({ items: cart })
            });

            if (res.ok) {
                const resp = await res.json();
                const cartId = resp.cart_id || resp.cart || 'N/A';
                const now = new Date().toLocaleString();

                // Build receipt HTML using local cart contents
                const rows = cart.map((it) => `
                                        <tr>
                                                <td style="padding:8px;border:1px solid #ddd">${it.name}</td>
                                                <td style="padding:8px;border:1px solid #ddd;text-align:center">${it.qty}</td>
                                                <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${it.price}</td>
                                                <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${(Number(it.price) || 0) * it.qty}</td>
                                        </tr>
                                `).join('');

                const totalAmount = cart.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);

                const receiptHtml = `<!doctype html>
                                <html>
                                <head>
                                    <meta charset="utf-8" />
                                    <title>Transaction Receipt</title>
                                    <style>
                                        body{font-family: Arial, Helvetica, sans-serif; padding:20px}
                                        .header{text-align:center;margin-bottom:20px}
                                        table{border-collapse:collapse;width:100%}
                                        @media print {
                                            .no-print { display: none; }
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="header">
                                        <h2>Store Receipt</h2>
                                        <div>Transaction ID: ${cartId}</div>
                                        <div>Date: ${now}</div>
                                        <div>Payment Method: ${paymentMethod.toUpperCase()}</div>
                                    </div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style="padding:8px;border:1px solid #ddd;text-align:left">Item</th>
                                                <th style="padding:8px;border:1px solid #ddd;text-align:center">Qty</th>
                                                <th style="padding:8px;border:1px solid #ddd;text-align:right">Price</th>
                                                <th style="padding:8px;border:1px solid #ddd;text-align:right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${rows}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold">Grand Total</td>
                                                <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold">₹${totalAmount}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    <script>
                                        window.onload = function(){ 
                                            setTimeout(function() {
                                                window.print();
                                                // Optional: window.close() after print if desired (browser dependent)
                                            }, 500); 
                                        };
                                    </script>
                                </body>
                                </html>`;

                if (printWindow) {
                    printWindow.document.open();
                    printWindow.document.write(receiptHtml);
                    printWindow.document.close();
                } else {
                    // Try opening again (less likely to work if blocked before) or alert
                    const w = window.open('', '_blank');
                    if (w) {
                        w.document.write(receiptHtml);
                        w.document.close();
                    } else {
                        alert('Transaction saved successfully! Please enable popups to print receipt.');
                    }
                }

                localStorage.removeItem('cart');
                setCart([]);
                navigate('/dashboard');
            } else {
                if (printWindow) printWindow.close();
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    setError('Error: ' + (data.error || data.detail || 'Unable to save transaction'));
                } else {
                    setError(`Server Error: ${res.status} ${res.statusText}. Check backend routes.`);
                }
            }
        } catch (e) {
            if (printWindow) printWindow.close();
            setError('Network error: ' + e.message);
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Your Shopping Cart
                </h1>

                {cart.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">It looks like you haven't added any items yet.</p>
                        <button
                            onClick={() => navigate('/product')}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                        {/* Cart Items List */}
                        <section className="col-span-12 lg:col-span-7">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <ul className="divide-y divide-gray-200">
                                    {cart.map((item) => (
                                        <li key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xl">
                                                {item.name.substring(0, 2).toUpperCase()}
                                            </div>

                                            <div className="flex-1 flex flex-col sm:flex-row sm:justify-between data-list">
                                                <div className="pr-6">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {item.name}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500">SKU: {item.sku}</p>
                                                    <p className="mt-1 text-sm font-medium text-indigo-600">₹{item.price}</p>
                                                </div>

                                                <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-6">
                                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                                        <button
                                                            onClick={() => dec(item.id)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                                                        </button>
                                                        <span className="px-4 py-1 text-sm font-semibold text-gray-900 border-x border-gray-300 min-w-[3rem] text-center">
                                                            {item.qty}
                                                        </span>
                                                        <button
                                                            onClick={() => inc(item.id)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => remove(item.id)}
                                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                        title="Remove item"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Order Summary */}
                        <section className="col-span-12 lg:col-span-5 mt-8 lg:mt-0">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:sticky lg:top-8">
                                <h2 className="text-lg font-medium text-gray-900 mb-6 border-b pb-4">Order Summary</h2>

                                <dl className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-gray-600">Subtotal ({cart.length} items)</dt>
                                        <dd className="text-sm font-medium text-gray-900">₹{total.toFixed(2)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-gray-600">Shipping Estimate</dt>
                                        <dd className="text-sm font-medium text-green-600">Free</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-gray-600">Tax Estimate</dt>
                                        <dd className="text-sm font-medium text-gray-900">Included</dd>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                                        <dt className="text-base font-bold text-gray-900">Order Total</dt>
                                        <dd className="text-2xl font-bold text-indigo-600">₹{total.toFixed(2)}</dd>
                                    </div>
                                </dl>

                                {error && (
                                    <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm flex items-start gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {error}
                                    </div>
                                )}

                                <div className="mt-6">
                                    <button
                                        onClick={initiateCheckout}
                                        disabled={loadingCheckout}
                                        className="w-full bg-indigo-600 border border-transparent rounded-xl shadow-md py-4 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                                    >
                                        {loadingCheckout ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Processing...
                                            </span>
                                        ) : 'Proceed to Checkout'}
                                    </button>
                                    <p className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        Secure Checkout
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Background overlay */}
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowPaymentModal(false)}></div>

                    {/* Modal positioning */}
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                        {/* Modal panel */}
                        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Payment Details</h3>
                                        <div className="mt-4 space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-500">Total Amount</span>
                                                <span className="text-2xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => setPaymentMethod('cash')}
                                                        className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <span className="text-2xl mb-1">💵</span>
                                                        <span className="text-sm font-medium">Cash</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setPaymentMethod('card')}
                                                        className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <span className="text-2xl mb-1">💳</span>
                                                        <span className="text-sm font-medium">Card / UPI</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={processPaymentAndCheckout}
                                    disabled={processingPayment}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    {processingPayment ? 'Processing...' : 'Pay & Print Receipt'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    disabled={processingPayment}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
