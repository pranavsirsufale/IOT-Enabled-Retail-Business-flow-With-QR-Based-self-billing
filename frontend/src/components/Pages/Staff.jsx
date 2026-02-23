import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

export default function Staff() {
    const { user } = useOutletContext();
    const isAllowed = user?.isAdmin || user?.role?.toLowerCase() === "admin";

    const [staffTypes, setStaffTypes] = useState([]);
    const [newType, setNewType] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [newStaffIsAdmin, setNewStaffIsAdmin] = useState(false);
    const [meLoading, setMeLoading] = useState(true);
    const [me, setMe] = useState(null);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedType, setSelectedType] = useState("");

    useEffect(() => {
        if (!isAllowed) return;

        fetch("/api/v1/me/", { credentials: "include" })
            .then((r) => r.json())
            .then((data) => {
                setMe(data);
                setIsAdmin(!!data.isAdmin);
                setMeLoading(false);
            })
            .catch(() => {
                setMeLoading(false);
            });

        loadTypes();
    }, [isAllowed]);

    if (!isAllowed) {
        return <div className="p-8 text-center text-red-600 font-bold">Access Denied. Admins only.</div>;
    }

    const loadTypes = () => {
        fetch("/api/v1/staff-types/", { credentials: "include" })
            .then((r) => r.json())
            .then((data) => setStaffTypes(data))
            .catch(() => setStaffTypes([]));
    };

    const handleAddType = async (e) => {
        e.preventDefault();
        try {
            const getCookie = (name) => {
                const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
                return v ? v.pop() : '';
            };
            const csrf = getCookie('csrftoken');

            const res = await fetch("/api/v1/staff-types/", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
                body: JSON.stringify({ type: newType }),
            });
            if (res.ok) {
                setNewType("");
                loadTypes();
                alert("Staff type added");
            } else {
                const d = await res.json();
                const errorMsg = d.detail || d.error || (typeof d === 'object' ? JSON.stringify(d) : "Error adding type");
                alert("Error: " + errorMsg);
            }
        } catch (e) {
            alert("Network error: " + e.message);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            const getCookie = (name) => {
                const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
                return v ? v.pop() : '';
            };
            const csrf = getCookie('csrftoken');

            const res = await fetch("/api/v1/staff/", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
                body: JSON.stringify({ username, password, name, type: Number(selectedType), isAdmin: newStaffIsAdmin, email, phone }),
            });

            if (res.ok) {
                setUsername("");
                setPassword("");
                setName("");
                setEmail("");
                setPhone("");
                setSelectedType("");
                setNewStaffIsAdmin(false);
                alert("Staff created");
            } else {
                const d = await res.json();
                const errorMsg = d.detail || d.error || (typeof d === 'object' ? JSON.stringify(d) : "Error creating staff");
                alert("Error: " + errorMsg);
            }
        } catch (e) {
            alert("Network error: " + e.message);
        }
    };

    if (meLoading) return <div className="p-8">Loading...</div>;

    if (!me || !isAdmin) return <div className="p-8">Unauthorized. Admins only.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-semibold mb-4">Staff Management</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="font-medium mb-2">Add Staff Type</h2>
                            <form onSubmit={handleAddType} className="flex gap-2">
                                <input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="Type name" className="flex-1 p-2 border rounded" required />
                                <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
                            </form>

                            <ul className="mt-4 space-y-2">
                                {staffTypes.map((t) => (
                                    <li key={t.id} className="text-sm">{t.type}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-medium mb-2">Add Staff Member</h2>
                            <form onSubmit={handleAddStaff} className="space-y-2">
                                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border rounded" required />
                                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" required />
                                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full p-2 border rounded" />
                                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 border rounded" />

                                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full p-2 border rounded" required>
                                    <option value="">Select Type</option>
                                    {staffTypes.map((t) => (
                                        <option key={t.id} value={t.id}>{t.type}</option>
                                    ))}
                                </select>

                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={newStaffIsAdmin} onChange={(e) => setNewStaffIsAdmin(e.target.checked)} />
                                    <span className="text-sm">Is Admin</span>
                                </label>

                                <div className="flex justify-end">
                                    <button className="bg-green-600 text-white px-4 py-2 rounded">Create Staff</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
