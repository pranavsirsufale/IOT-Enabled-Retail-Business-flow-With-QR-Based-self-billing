import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/me/", {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) {
          navigate("/");
          return;
        }
        return res.json();
      })
      .then(data => setUser(data));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch("http://127.0.0.1:8000/api/v1/logout/", {
      method: "POST",
      credentials: "include",
    });

    navigate("/");
  };

  if (!user) return <p className="text-center mt-20">Loading...</p>;

  const firstLetter = user.username.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="relative">

        {/* Avatar */}
        <div
          onClick={() => setOpen(!open)}
          className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold cursor-pointer shadow-lg"
        >
          {firstLetter}
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-28 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-xl w-64 text-center">
            
            <h2 className="text-xl font-semibold mb-2">
              {user.username}
            </h2>

            <p className="text-gray-600 mb-4">
              Role: User
            </p>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}

      </div>
    </div>
  );
}