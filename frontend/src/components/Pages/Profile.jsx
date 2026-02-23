import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on component mount
  useEffect(() => {
    fetch("/api/v1/me/", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/logout/", {
        method: "POST",
        credentials: "include",
      });

      // IMPORTANT: Clear user state to show Login button immediately
      setUser(null);
      setOpen(false);
      navigate("/"); // Redirect to home after logout
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) return <div className="text-sm text-gray-400">...</div>;

  // IF LOGGED OUT: Show Login Button
  if (!user) {
    return (
      <Link
        to="/login"
        className="text-white bg-orange-700 hover:bg-orange-800 font-medium rounded-lg text-sm px-5 py-2.5 transition-all"
      >
        Log in
      </Link>
    );
  }

  // IF LOGGED IN: Show Profile Avatar and a small profile card when opened
  const displayName = user.name || user.username;
  const firstLetter = displayName?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-md hover:bg-blue-700 transition-all"
      >
        {firstLetter}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}></div>

          <div className="absolute right-0 mt-2 bg-white p-4 rounded-lg shadow-xl border w-56 z-20">
            <div className="mb-3">
              <p className="text-sm font-bold text-gray-800 truncate">{displayName}</p>
              <p className="text-xs text-gray-500">{user.role || '-'}</p>
            </div>

            <div className="space-y-2">
              <Link to="/profile" className="block text-sm text-gray-700 hover:text-gray-900">View profile</Link>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}