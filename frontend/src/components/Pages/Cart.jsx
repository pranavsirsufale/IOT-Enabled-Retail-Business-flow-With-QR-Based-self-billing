import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function Cart() {
    const { user } = useOutletContext();
    const isAllowed = user?.isAdmin || user?.role?.toLowerCase() === "store manager" || user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "security staff";

    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

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

            fetch('/api/v1/cart/save/', {
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
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        setError(null);
        if (!cart.length) return setError('Cart is empty');

        setLoadingCheckout(true);
        try {
            // verify session
            const me = await fetch('/api/v1/me/', { credentials: 'include' });
            if (!me.ok) {
                setLoadingCheckout(false);
                setError('You must be logged in to checkout');
                return;
            }

            // Read CSRF token from cookie
            const getCookie = (name) => {
                const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
                return v ? v.pop() : '';
            };
            const csrf = getCookie('csrftoken');

            const res = await fetch('/api/v1/transaction/', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
                body: JSON.stringify({ items: cart })
            });

            if (res.ok) {
                const resp = await res.json();
                const cartId = resp.cart;
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
                                    </style>
                                </head>
                                <body>
                                    <div class="header">
                                        <h2>Store Receipt</h2>
                                        <div>Transaction ID: ${cartId}</div>
                                        <div>Date: ${now}</div>
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
                                        window.onload = function(){ window.print(); };
                                    </script>
                                </body>
                                </html>`;

                const w = window.open('', '_blank');
                if (w) {
                    w.document.write(receiptHtml);
                    w.document.close();
                } else {
                    // fallback alert
                    alert('Transaction saved. Unable to open print window.');
                }

                localStorage.removeItem('cart');
                setCart([]);
                navigate('/dashboard');
            } else {
                const data = await res.json();
                setError('Error: ' + (data.error || data.detail || 'Unable to save transaction'));
            }
        } catch (e) {
            setError('Network error: ' + e.message);
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Cart</h2>

                    {cart.length === 0 ? (
                        <div className="text-gray-600">Your cart is empty. <button onClick={() => navigate('/product')} className="ml-2 text-blue-600">Browse products</button></div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border rounded p-3">
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm">₹{item.price}</div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => dec(item.id)} className="px-2 bg-gray-100 rounded">-</button>
                                            <div className="px-2">{item.qty}</div>
                                            <button onClick={() => inc(item.id)} className="px-2 bg-gray-100 rounded">+</button>
                                        </div>
                                        <button onClick={() => remove(item.id)} className="ml-4 text-red-600">Remove</button>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-4 border-t">
                                <div className="font-semibold">Total</div>
                                <div className="font-bold">₹{total}</div>
                            </div>
                            {error && <div className="text-red-600 mb-2">{error}</div>}
                            <div className="flex justify-end mt-4">
                                <button onClick={handleCheckout} disabled={loadingCheckout} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60">
                                    {loadingCheckout ? 'Processing...' : 'Checkout'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
