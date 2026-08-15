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
  const [desktopUrl, setDesktopUrl] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copyText, setCopyText] = useState("Copy Link");

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchStatsAndLinks();
  }, [isLoggedIn, message]);

  const fetchStatsAndLinks = async () => {
    try {
      const resStats = await fetch("/api/stats");
      const dataStats = await resStats.json();
      setStats(dataStats);
      const resLinks = await fetch("/api/links");
      const dataLinks = await resLinks.json();
      if (dataLinks.success) setLinksList(dataLinks.links);
    } catch (error) { console.log("Failed to fetch data"); }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "12345") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password!");
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setMessage("Generating short link...");
    setGeneratedLink("");
    const res = await fetch("/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desktopUrl, mobileUrl }),
    });
    const data = await res.json();
    if (data.success) {
      const fullLink = `${window.location.origin}/r?code=${data.code}`;
      setGeneratedLink(fullLink);
      setMessage("✨ Short link generated successfully!");
      setDesktopUrl("");
      setMobileUrl("");
      fetchStatsAndLinks();
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopyText("Copied! 🎉");
    setTimeout(() => setCopyText("Copy Link"), 2000);
  };

  const handleDelete = async (code) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if ((await res.json()).success) fetchStatsAndLinks();
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(135deg, #0f172a 1e-3%, #1e293b 100%)", fontFamily: "'Inter', sans-serif" }}>
        <form onSubmit={handleLogin} style={{ padding: "45px 35px", background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", width: "100%", maxWidth: "400px", boxSizing: "border-box" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2 style={{ color: "#f8fafc", fontSize: "26px", fontWeight: "800", margin: "0 0 8px 0" }}>⚡ QuickURL</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Sign in to access your dashboard</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Username</label>
            <input type="text" placeholder="admin" onChange={(e) => setUsername(e.target.value)} required style={{ width: "100%", padding: "12px 16px", background: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#fff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Password</label>
            <input type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px 16px", background: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#fff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
          <button type="submit" style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)", transition: "opacity 0.2s" }}>Sign In</button>
          {loginError && <p style={{ color: "#ef4444", textAlign: "center", fontSize: "13px", marginTop: "14px", fontWeight: "500" }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: "#0f172a", color: "#f8fafc" }}>
      
      {/* Sidebar */}
      <div style={{ width: "260px", background: "#1e293b", borderRight: "1px solid #334155", padding: "30px 20px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc", margin: "0 0 35px 10px", letterSpacing: "-0.5px" }}>⚡ QuickURL</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "links", label: "🔗 Short Links" },
            { id: "stats", label: "📈 Statistics" }
          ].map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "12px 16px", cursor: "pointer", borderRadius: "10px", fontWeight: "600", fontSize: "14px", background: activeTab === t.id ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" : "transparent", color: activeTab === t.id ? "#fff" : "#94a3b8", boxShadow: activeTab === t.id ? "0 4px 12px rgba(99, 102, 241, 0.3)" : "none", transition: "all 0.2s" }}>{t.label}</div>
          ))}
        </div>
        <button onClick={() => { localStorage.clear(); location.reload(); }} style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px", transition: "background 0.2s" }}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px", boxSizing: "border-box", overflowY: "auto" }}>
        
        {activeTab === "dashboard" && (
          <div style={{ maxWidth: "750px" }}>
            <div style={{ marginBottom: "30px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: "700", margin: "0 0 6px 0" }}>Create Smart Short Link</h1>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Instantly generate responsive redirects for mobile and desktop users.</p>
            </div>

            <div style={{ background: "#1e293b", padding: "35px", borderRadius: "16px", border: "1px solid #334155", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
              <form onSubmit={handleCreateLink} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#cbd5e1" }}>💻 Desktop Destination URL</label>
                  <input type="url" value={desktopUrl} placeholder="https://example.com/desktop-page" onChange={(e) => setDesktopUrl(e.target.value)} required style={{ width: "100%", padding: "14px", background: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#fff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#cbd5e1" }}>📱 Mobile Destination URL</label>
                  <input type="url" value={mobileUrl} placeholder="https://example.com/mobile-page" onChange={(e) => setMobileUrl(e.target.value)} required style={{ width: "100%", padding: "14px", background: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#fff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
                <button type="submit" style={{ padding: "14px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)", transition: "opacity 0.2s" }}>✨ Generate Short Link</button>
              </form>

              {generatedLink && (
                <div style={{ marginTop: "25px", padding: "16px", background: "#0f172a", borderRadius: "12px", border: "1px solid #334155", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <input readOnly value={generatedLink} style={{ flex: 1, minWidth: "220px", padding: "10px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#38bdf8", fontSize: "14px", outline: "none" }} />
                  <button onClick={handleCopy} style={{ padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>{copyText}</button>
                </div>
              )}

              {message && !generatedLink && <p style={{ marginTop: "15px", color: "#38bdf8", fontSize: "14px", fontWeight: "500" }}>{message}</p>}
            </div>
          </div>
        )}

        {activeTab === "links" && (
          <div style={{ maxWidth: "850px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px" }}>🔗 All Created Links</h2>
            {linksList.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No short links found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {linksList.map(item => (
                  <div key={item.code} style={{ padding: "20px", background: "#1e293b", border: "1px solid #334155", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div style={{ wordBreak: "break-all" }}>
                      <a href={`/r?code=${item.code}`} target="_blank" style={{ color: "#38bdf8", fontWeight: "700", fontSize: "16px", textDecoration: "none" }}>{window.location.origin}/r?code={item.code}</a>
                      <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>💻 Desktop: {item.desktopUrl}</div>
                      <div style={{ fontSize: "13px", color: "#94a3b8" }}>📱 Mobile: {item.mobileUrl}</div>
                    </div>
                    <button onClick={() => handleDelete(item.code)} style={{ padding: "8px 14px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div style={{ maxWidth: "750px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px" }}>📈 System Analytics</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <div style={{ padding: "30px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                <p style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px", margin: "0 0 10px 0" }}>TOTAL LINKS</p>
                <h2 style={{ margin: 0, color: "#38bdf8", fontSize: "36px", fontWeight: "800" }}>{stats.totalLinks}</h2>
              </div>
              <div style={{ padding: "30px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                <p style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px", margin: "0 0 10px 0" }}>TOTAL VISITORS</p>
                <h2 style={{ margin: 0, color: "#10b981", fontSize: "36px", fontWeight: "800" }}>{stats.totalVisitors}</h2>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
