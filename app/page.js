"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard"); // Tab system
  const [stats, setStats] = useState({ totalLinks: 0, totalVisitors: 0 }); // Live stats

  const [subdomain, setSubdomain] = useState("");
  const [desktopUrl, setDesktopUrl] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [message, setMessage] = useState("");

  // লগইন করার পর স্ট্যাটস লোড হবে
  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(() => console.log("Failed to load stats"));
    }
  }, [isLoggedIn, message]); // নতুন লিংক বানালে স্ট্যাটস আপডেট হবে

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "12345") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid Login!");
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
      setMessage(`Success! Link created: ${subdomain}.yourdomain.com`);
      setSubdomain("");
      setDesktopUrl("");
      setMobileUrl("");
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8f9fa", fontFamily: "sans-serif" }}>
        <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#007bff" }}>🚀 QuickURL Login</h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />
            <button type="submit" style={{ padding: "12px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Login</button>
            {loginError && <p style={{ color: "red", textAlign: "center", margin: 0 }}>{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  // Sidebar Menu Item Component
  const MenuItem = ({ label, tabName }) => (
    <li 
      onClick={() => setActiveTab(tabName)}
      style={{ 
        fontWeight: activeTab === tabName ? "bold" : "normal", 
        color: activeTab === tabName ? "#333" : "#666", 
        backgroundColor: activeTab === tabName ? "#e9ecef" : "transparent", 
        padding: "8px 12px", 
        borderRadius: "5px",
        cursor: "pointer",
        marginBottom: "5px"
      }}
    >
      {label}
    </li>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f8f9fa" }}>
      
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#fff", padding: "20px", borderRight: "1px solid #ddd", display: "flex", flexDirection: "column" }}>
        <h2 style={{ color: "#007bff", marginBottom: "30px" }}>🚀 QuickURL</h2>
        <ul style={{ listStyle: "none", padding: 0, flex: 1 }}>
          <MenuItem label="📊 Dashboard" tabName="dashboard" />
          <MenuItem label="🔗 Short Links" tabName="links" />
          <MenuItem label="📈 Statistics" tabName="stats" />
          <MenuItem label="🌐 Domain Settings" tabName="domains" />
        </ul>
        <button onClick={() => setIsLoggedIn(false)} style={{ padding: "10px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px" }}>
        
        {activeTab === "dashboard" && (
          <>
            <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Dashboard Overview</h1>
            
            {/* Live Stats Cards */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
              <div style={{ padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", flex: 1 }}>
                <p style={{ color: "#666", margin: 0, fontSize: "14px", fontWeight: "bold" }}>TOTAL LINKS</p>
                <h2 style={{ margin: "5px 0 0 0", color: "#007bff" }}>{stats.totalLinks}</h2>
              </div>
              <div style={{ padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", flex: 1 }}>
                <p style={{ color: "#666", margin: 0, fontSize: "14px", fontWeight: "bold" }}>TOTAL VISITORS</p>
                <h2 style={{ margin: "5px 0 0 0", color: "#28a745" }}>{stats.totalVisitors}</h2>
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
                    <span style={{ padding: "10px", backgroundColor: "#e9ecef", border: "1px solid #ccc", borderLeft: "none", borderRadius: "0 4px 4px 0" }}>.yourdomain.com</span>
                  </div>
                </div>
                <input type="url" value={desktopUrl} onChange={(e) => setDesktopUrl(e.target.value)} placeholder="Desktop Destination URL" required style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />
                <input type="url" value={mobileUrl} onChange={(e) => setMobileUrl(e.target.value)} placeholder="Mobile Destination URL" required style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />
                <button type="submit" style={{ padding: "12px", backgroundColor: "#20c997", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>+ Create Link</button>
                {message && <p style={{ marginTop: "15px", color: message.includes("Error") ? "red" : "green", fontWeight: "bold" }}>{message}</p>}
              </form>
            </div>
          </>
        )}

        {/* Other Tabs content (Placeholder) */}
        {activeTab !== "dashboard" && (
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
            <h2>{activeTab === "links" ? "Short Links List" : activeTab === "stats" ? "Detailed Statistics" : "Domain Settings"}</h2>
            <p style={{ color: "#666" }}>This section will display data for {activeTab}. (You can add tables here later!)</p>
          </div>
        )}

      </div>
    </div>
  );
}
