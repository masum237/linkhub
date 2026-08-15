"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ totalLinks: 0, totalVisitors: 0 });

  const [subdomain, setSubdomain] = useState("");
  const [desktopUrl, setDesktopUrl] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(() => console.log("Failed to load stats"));
    }
  }, [isLoggedIn, message]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "12345") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password!");
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setMessage("Creating short link...");

    const res = await fetch("/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subdomain, desktopUrl, mobileUrl }),
    });
    
    const data = await res.json();
    if (data.success) {
      setMessage(`🎉 Success! Your short link: ${subdomain}.yourdomain.com`);
      setSubdomain("");
      setDesktopUrl("");
      setMobileUrl("");
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  // Login Page UI
  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: "#ffffff", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", width: "100%", maxWidth: "420px" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2 style={{ color: "#333", fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0" }}>⚡ QuickURL</h2>
            <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Sign in to manage your smart links</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "6px" }}>Username</label>
              <input type="text" placeholder="Enter username (admin)" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "6px" }}>Password</label>
              <input type="password" placeholder="Enter password (12345)" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button type="submit" style={{ padding: "13px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "10px", boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)" }}>Login to Dashboard</button>
            {loginError && <p style={{ color: "#e53e3e", textAlign: "center", fontSize: "13px", fontWeight: "500", margin: "5px 0 0 0" }}>{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  const MenuItem = ({ label, tabName }) => (
    <li 
      onClick={() => setActiveTab(tabName)}
      style={{ 
        fontWeight: activeTab === tabName ? "600" : "500", 
        color: activeTab === tabName ? "#667eea" : "#4a5568", 
        backgroundColor: activeTab === tabName ? "#ebf4ff" : "transparent", 
        padding: "12px 16px", 
        borderRadius: "8px",
        cursor: "pointer",
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        transition: "all 0.2s ease"
      }}
    >
      {label}
    </li>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: "#f7fafc" }}>
      
      {/* Sidebar */}
      <div style={{ width: "260px", backgroundColor: "#ffffff", padding: "24px 16px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 10px", marginBottom: "35px" }}>
          <h2 style={{ color: "#2d3748", fontSize: "22px", fontWeight: "800", margin: 0 }}>⚡ QuickURL</h2>
        </div>
        
        <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
          <MenuItem label="📊 Dashboard" tabName="dashboard" />
          <MenuItem label="🔗 Short Links" tabName="links" />
          <MenuItem label="📈 Statistics" tabName="stats" />
          <MenuItem label="🌐 Domain Settings" tabName="domains" />
        </ul>

        <button onClick={() => setIsLoggedIn(false)} style={{ padding: "12px", backgroundColor: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", width: "100%", transition: "background 0.2s" }}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "40px", boxSizing: "border-box", maxWidth: "1200px" }}>
        
        {activeTab === "dashboard" && (
          <>
            <div style={{ marginBottom: "30px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#1a202c", margin: "0 0 6px 0" }}>Dashboard Overview</h1>
              <p style={{ color: "#718096", fontSize: "14px", margin: 0 }}>Monitor your smart link analytics and generate new redirects instantly.</p>
            </div>
            
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "35px" }}>
              <div style={{ padding: "24px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
                <p style={{ color: "#718096", margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px" }}>TOTAL LINKS</p>
                <h2 style={{ margin: 0, color: "#2b6cb0", fontSize: "32px", fontWeight: "800" }}>{stats.totalLinks}</h2>
              </div>
              <div style={{ padding: "24px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
                <p style={{ color: "#718096", margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px" }}>TOTAL VISITORS</p>
                <h2 style={{ margin: 0, color: "#38a169", fontSize: "32px", fontWeight: "800" }}>{stats.totalVisitors}</h2>
              </div>
            </div>

            {/* Create Link Card */}
            <div style={{ backgroundColor: "#ffffff", padding: "35px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", maxWidth: "700px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#2d3748", margin: "0 0 20px 0" }}>Create Advanced Short Link</h3>
              
              <form onSubmit={handleCreateLink} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#4a5568" }}>Subdomain Prefix</label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase())} placeholder="e.g. fashion" required style={{ flex: 1, padding: "12px 14px", border: "1px solid #cbd5e0", borderRight: "none", borderRadius: "8px 0 0 8px", outline: "none", fontSize: "14px" }} />
                    <span style={{ padding: "12px 16px", backgroundColor: "#edf2f7", border: "1px solid #cbd5e0", borderRadius: "0 8px 8px 0", color: "#4a5568", fontSize: "14px", fontWeight: "500" }}>.yourdomain.com</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#4a5568" }}>Desktop Destination URL</label>
                  <input type="url" value={desktopUrl} onChange={(e) => setDesktopUrl(e.target.value)} placeholder="https://example.com/desktop-page" required style={{ width: "100%", padding: "12px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#4a5568" }}>Mobile Destination URL</label>
                  <input type="url" value={mobileUrl} onChange={(e) => setMobileUrl(e.target.value)} placeholder="https://example.com/mobile-page" required style={{ width: "100%", padding: "12px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
                </div>

                <button type="submit" style={{ padding: "14px", backgroundColor: "#319795", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 12px rgba(49, 151, 149, 0.3)", transition: "background 0.2s" }}>
                  ✨ Generate Short Link
                </button>

                {message && (
                  <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: message.includes("Error") ? "#fff5f5" : "#f0fff4", border: `1px solid ${message.includes("Error") ? "#feb2b2" : "#c6f6d5"}`, color: message.includes("Error") ? "#c53030" : "#22543d", fontSize: "14px", fontWeight: "500", wordBreak: "break-all" }}>
                    {message}
                  </div>
                )}
              </form>
            </div>
          </>
        )}

        {/* Other Tabs */}
        {activeTab !== "dashboard" && (
          <div style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2d3748", margin: "0 0 10px 0" }}>
              {activeTab === "links" ? "🔗 All Short Links" : activeTab === "stats" ? "📈 Detailed Statistics" : "🌐 Domain Settings"}
            </h2>
            <p style={{ color: "#718096", fontSize: "14px", margin: 0 }}>This section is currently active and ready for custom features.</p>
          </div>
        )}

      </div>
    </div>
  );
}
