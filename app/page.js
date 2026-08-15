"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ totalLinks: 0, totalVisitors: 0 });
  const [linksList, setLinksList] = useState([]);

  const [subdomain, setSubdomain] = useState("");
  const [desktopUrl, setDesktopUrl] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [message, setMessage] = useState("");

  // পেজ লোড হওয়ার সাথে সাথে চেক করবে আগে লগইন করা ছিল কিনা
  useEffect(() => {
    const savedLogin = localStorage.getItem("isLoggedIn");
    if (savedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchStatsAndLinks();
    }
  }, [isLoggedIn, message]);

  const fetchStatsAndLinks = async () => {
    try {
      const resStats = await fetch("/api/stats");
      const dataStats = await resStats.json();
      setStats(dataStats);

      const resLinks = await fetch("/api/links");
      const dataLinks = await resLinks.json();
      if (dataLinks.success) {
        setLinksList(dataLinks.links);
      }
    } catch (error) {
      console.log("Failed to fetch data");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "12345") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true"); // ব্রাউজারে সেভ করে রাখা
      setLoginError("");
    } else {
      setLoginError("Invalid username or password!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn"); // লগআউট করলে ক্লিয়ার হয়ে যাবে
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
      fetchStatsAndLinks();
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  const handleDelete = async (sub) => {
    if (!confirm(`Are you sure you want to delete ${sub}?`)) return;
    
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subdomain: sub }),
    });
    const data = await res.json();
    if (data.success) {
      fetchStatsAndLinks();
    } else {
      alert("Failed to delete");
    }
  };

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
              <input type="text" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "6px" }}>Password</label>
              <input type="password" placeholder="12345" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
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
        gap: "10px"
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

        <button onClick={handleLogout} style={{ padding: "12px", backgroundColor: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", width: "100%" }}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px", boxSizing: "border-box", maxWidth: "1200px" }}>
        
        {activeTab === "dashboard" && (
          <>
            <div style={{ marginBottom: "30px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#1a202c", margin: "0 0 6px 0" }}>Dashboard Overview</h1>
              <p style={{ color: "#718096", fontSize: "14px", margin: 0 }}>Monitor your smart link analytics and generate new redirects instantly.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "35px" }}>
              <div style={{ padding: "24px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
                <p style={{ color: "#718096", margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700" }}>TOTAL LINKS</p>
                <h2 style={{ margin: 0, color: "#2b6cb0", fontSize: "32px", fontWeight: "800" }}>{stats.totalLinks}</h2>
              </div>
              <div style={{ padding: "24px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
                <p style={{ color: "#718096", margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700" }}>TOTAL VISITORS</p>
                <h2 style={{ margin: 0, color: "#38a169", fontSize: "32px", fontWeight: "800" }}>{stats.totalVisitors}</h2>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "35px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", maxWidth: "700px" }}>
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
                  <input type="url" value={desktopUrl} onChange={(e) => setDesktopUrl(e.target.value)} placeholder="https://example.com/desktop" required style={{ width: "100%", padding: "12px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#4a5568" }}>Mobile Destination URL</label>
                  <input type="url" value={mobileUrl} onChange={(e) => setMobileUrl(e.target.value)} placeholder="https://example.com/mobile" required style={{ width: "100%", padding: "12px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
                </div>

                <button type="submit" style={{ padding: "14px", backgroundColor: "#319795", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 12px rgba(49, 151, 149, 0.3)" }}>
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

        {activeTab === "links" && (
          <div style={{ backgroundColor: "#ffffff", padding: "35px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2d3748", margin: "0 0 20px 0" }}>🔗 All Created Short Links</h2>
            {linksList.length === 0 ? (
              <p style={{ color: "#718096" }}>No links created yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {linksList.map((item, idx) => (
                  <div key={idx} style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
                    <div>
                      <strong style={{ color: "#3182ce", fontSize: "15px" }}>{item.subdomain}.yourdomain.com</strong>
                      <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>💻 Desktop: {item.desktopUrl}</div>
                      <div style={{ fontSize: "12px", color: "#718096" }}>📱 Mobile: {item.mobileUrl}</div>
                    </div>
                    <button onClick={() => handleDelete(item.subdomain)} style={{ padding: "8px 12px", background: "#feb2b2", color: "#9b2c2c", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div style={{ backgroundColor: "#ffffff", padding: "35px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2d3748", margin: "0 0 20px 0" }}>📈 Live Statistics</h2>
            <p style={{ color: "#4a5568", fontSize: "15px", marginBottom: "15px" }}>Total active short links: <b>{stats.totalLinks}</b></p>
            <p style={{ color: "#4a5568", fontSize: "15px" }}>Total visitor redirections: <b>{stats.totalVisitors}</b></p>
          </div>
        )}

        {activeTab === "domains" && (
          <div style={{ backgroundColor: "#ffffff", padding: "35px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2d3748", margin: "0 0 15px 0" }}>🌐 Domain Settings</h2>
            <p style={{ color: "#718096", fontSize: "14px", lineHeight: "1.6" }}>
              To connect your custom domain, point your wildcard DNS record (<code>*.yourdomain.com</code>) to your Vercel project deployment target.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
