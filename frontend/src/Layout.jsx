import React, { useState, useEffect } from 'react'
import { Footer, Header } from './components'
import { Outlet } from 'react-router-dom'
import { apiFetch, clearAccessToken } from './api'

function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    apiFetch("/api/v1/me/")
      .then(async (res) => {
        if (res.status === 401) {
          clearAccessToken();
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Guest user");
        return await res.json();
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

  return (
    <>
      <Header user={user} setUser={setUser} loading={loading} />
      <Outlet context={{ user, setUser, loading }} />
      {/* <Footer /> */}
    </>
  )
}

export default Layout