"use client";
import { useState } from "react";

export default function Dashboard() {
  // Login States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Dashboard States
  const [subdomain, setSubdomain] = useState("");
  const [desktopUrl, setDesktopUrl] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // নিচে "admin" এবং "12345" এর জায়গায় আপনার পছন্দমতো ইউজারনেম ও পাসওয়ার্ড বসিয়ে নিতে পারেন
    if (username === "masumhub" && password === "masumhub") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("ভুল ইউজারনেম বা পাসওয়ার্ড!");
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setMessage("Creating...");

    const res = await fetch("/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subdomain, desktopUrl, mobileUrl }),
    });
    
    const data = await res.json();
    if (data.success) {
      setMessage(`Success! Your link: ${subdomain}.yourdomain.com`);
      setSubdomain("");
      setDesktopUrl("");
      setMobileUrl("");
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  // যদি লগইন করা না থাকে, তাহলে লগইন পেজ দেখাবে
  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8f9fa", fontFamily: "sans-serif" }}>
        <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#007bff" }}>🚀 QuickURL Login</h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize:"14px" }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", outline:"none" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize:"14px" }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", outline:"none" }} />
            </div>
            <button type="submit" style={{ padding: "12px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>Login</button>
            {loginError && <p style={{ color: "red", textAlign: "center", margin: "10px 0 0 0", fontWeight: "bold" }}>{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  // লগইন সফল হলে ড্যাশবোর্ড দেখাবে
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f8f9fa" }}>
      
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#fff", padding: "20px", borderRight: "1px solid #ddd" }}>
        <h2 style={{ color: "#007bff", marginBottom: "30px" }}>🚀 QuickURL</h2>
        <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.5" }}>
          <li style={{ fontWeight: "bold", color: "#333", backgroundColor: "#e9ecef", padding: "5px 10px", borderRadius: "5px" }}>📊 Dashboard</li>
          <li style={{ color: "#666", padding: "5px 10px" }}>🔗 Short Links</li>
          <li style={{ color: "#666", padding: "5px 10px" }}>📈 Statistics</li>
          <li style={{ color: "#666", padding: "5px 10px" }}>🌐 Domain Settings</li>
        </ul>
        <button onClick={() => setIsLoggedIn(false)} style={{ marginTop: "50px", padding: "10px", width: "100%", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Dashboard Overview</h1>
        
        {/* Stats Cards */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
          <div style={{ padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", flex: 1 }}>
            <p style={{ color: "#666", margin: 0, fontSize: "14px", fontWeight: "bold" }}>TOTAL LINKS</p>
            <h2 style={{ margin: "5px 0 0 0" }}>1</h2>
          </div>
          <div style={{ padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", flex: 1 }}>
            <p style={{ color: "#666", margin: 0, fontSize: "14px", fontWeight: "bold" }}>TOTAL VISITORS</p>
            <h2 style={{ margin: "5px 0 0 0" }}>858</h2>
          </div>
        </div>

        {/* Create Link Form */}
        <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>Create Advanced Short Link</h2>
          <form onSubmit={handleCreateLink} style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "500px" }}>
            
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize:"14px" }}>Subdomain Prefix</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase())} placeholder="e.g. iphone17" required style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "4px 0 0 4px", outline: "none" }} />
                <span style={{ padding: "10px", backgroundColor: "#e9ecef", border: "1px solid #ccc", borderLeft: "none", borderRadius: "0 4px 4px 0", color: "#555" }}>.yourdomain.com</span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize:"14px" }}>Desktop Destination URL</label>
              <input type="url" value={desktopUrl} onChange={(e) => setDesktopUrl(e.target.value)} placeholder="https://www.apple.com/..." required style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", outline: "none" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize:"14px" }}>Mobile Destination URL</label>
              <input type="url" value={mobileUrl} onChange={(e) => setMobileUrl(e.target.value)} placeholder="https://your-mobile-link.com/..." required style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", outline: "none" }} />
            </div>

            <button type="submit" style={{ padding: "12px", backgroundColor: "#20c997", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
              + Create Link
            </button>
            
            {message && <p style={{ marginTop: "15px", color: message.includes("Error") ? "red" : "green", fontWeight: "bold" }}>{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
