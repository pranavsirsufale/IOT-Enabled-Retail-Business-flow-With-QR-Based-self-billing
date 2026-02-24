import React, { useState, useEffect } from 'react'
import { Footer, Header } from './components'
import { Outlet } from 'react-router-dom'

function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    fetch("/api/v1/me/", { credentials: "include" })
      .then((res) => {
        if (!res.ok || res.redirected || !res.headers.get("content-type")?.includes("application/json")) {
          throw new Error("Guest user");
        }
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

  return (
    <>
      <Header user={user} setUser={setUser} loading={loading} />
      <Outlet context={{ user, setUser, loading }} />
      {/* <Footer /> */}
    </>
  )
}

export default Layout