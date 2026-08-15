"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("activeTab") || "dashboard";
    }
    return "dashboard";
  });

  const [stats, setStats] = useState({ totalLinks: 0, totalVisitors: 0, todayVisitors: 0, countries: {}, devices: {}, platforms: {} });
  const [linksList, setLinksList] = useState([]);
  const [desktopUrl, setDesktopUrl] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copyText, setCopyText] = useState("Copy Link");

  // Edit State
  const [editingCode, setEditingCode] = useState(null);
  const [editDesktop, setEditDesktop] = useState("");
  const [editMobile, setEditMobile] = useState("");

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchStatsAndLinks();
  }, [isLoggedIn, message]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab]);

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
    // ইউজারনেম এবং পাসওয়ার্ড 'masumhub' সেট করা হয়েছে
    if (username === "masumhub" && password === "masumhub") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password! (Use: masumhub / masumhub)");
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
      setGeneratedLink(`${window.location.origin}/r?code=${data.code}`);
      setMessage("✨ Short link generated successfully!");
      setDesktopUrl("");
      setMobileUrl("");
      fetchStatsAndLinks();
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  const handleUpdateLink = async (code) => {
    const res = await fetch("/api/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, desktopUrl: editDesktop, mobileUrl: editMobile }),
    });
    const data = await res.json();
    if (data.success) {
      setEditingCode(null);
      fetchStatsAndLinks();
    } else {
      alert("Failed to update link");
    }
  };

  const handleDelete = async (code) => {
    if (!confirm("Are you sure?")) return;
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    fetchStatsAndLinks();
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f172a", fontFamily: "'Inter', sans-serif" }}>
        <form onSubmit={handleLogin} style={{ padding: "40px", background: "#1e293b", borderRadius: "16px", width: "380px", border: "1px solid #334155" }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: "800", margin: "0 0 5px 0" }}>🔗 LinkHub</h2>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>Smart URL Shortener & Device Redirector</p>
          </div>
          <input type="text" placeholder="Username (masumhub)" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: "100%", padding: "12px", background: "#0f172a", border: "1px solid #334155", color: "#fff", borderRadius: "8px", marginBottom: "15px", boxSizing: "border-box" }} />
          <input type="password" placeholder="Password (masumhub)" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px", background: "#0f172a", border: "1px solid #334155", color: "#fff", borderRadius: "8px", marginBottom: "20px", boxSizing: "border-box" }} />
          <button type="submit" style={{ width: "100%", padding: "12px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Login to LinkHub</button>
          {loginError && <p style={{ color: "#ef4444", marginTop: "12px", fontSize: "13px", textAlign: "center" }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: "#0f172a", color: "#f8fafc" }}>
      {/* Sidebar */}
      <div style={{ width: "260px", background: "#1e293b", borderRight: "1px solid #334155", padding: "30px 20px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc", margin: "0 0 35px 10px" }}>🔗 LinkHub</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "links", label: "🔗 Short Links" },
            { id: "stats", label: "📈 Statistics" }
          ].map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "12px 16px", cursor: "pointer", borderRadius: "10px", fontWeight: "600", fontSize: "14px", background: activeTab === t.id ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" : "transparent", color: activeTab === t.id ? "#fff" : "#94a3b8" }}>{t.label}</div>
          ))}
        </div>
        <button onClick={() => { localStorage.clear(); sessionStorage.clear(); location.reload(); }} style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}>🚪 Logout</button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "40px", boxSizing: "border-box", overflowY: "auto" }}>
        
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div style={{ maxWidth: "750px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "20px" }}>Create Smart Short Link</h1>
            <div style={{ background: "#1e293b", padding: "35px", borderRadius: "16px", border: "1px solid #334155" }}>
              <form onSubmit={handleCreateLink} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <input type="url" value={desktopUrl} placeholder="Desktop URL" onChange={(e) => setDesktopUrl(e.target.value)} required style={{ width: "100%", padding: "14px", background: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }} />
                <input type="url" value={mobileUrl} placeholder="Mobile URL" onChange={(e) => setMobileUrl(e.target.value)} required style={{ width: "100%", padding: "14px", background: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "#fff", boxSizing: "border-box" }} />
                <button type="submit" style={{ padding: "14px", background: "#10b981", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>✨ Generate Short Link</button>
              </form>
              {generatedLink && (
                <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <input readOnly value={generatedLink} style={{ flex: 1, padding: "10px", background: "#0f172a", border: "1px solid #334155", color: "#38bdf8", borderRadius: "8px" }} />
                  <button onClick={() => { navigator.clipboard.writeText(generatedLink); setCopyText("Copied!"); setTimeout(() => setCopyText("Copy Link"), 2000); }} style={{ padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>{copyText}</button>
                </div>
              )}
              {message && !generatedLink && <p style={{ marginTop: "15px", color: "#38bdf8" }}>{message}</p>}
            </div>
          </div>
        )}

        {/* Short Links Tab */}
        {activeTab === "links" && (
          <div style={{ maxWidth: "900px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", margin: 0 }}>🔗 All Created Links</h2>
              <span style={{ background: "#334155", padding: "6px 14px", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>Total Links: {linksList.length}</span>
            </div>
            {linksList.length === 0 ? <p style={{ color: "#94a3b8" }}>No short links found.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {linksList.map(item => (
                  <div key={item.code} style={{ padding: "20px", background: "#1e293b", border: "1px solid #334155", borderRadius: "14px" }}>
                    {editingCode === item.code ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <input type="url" value={editDesktop} onChange={(e) => setEditDesktop(e.target.value)} placeholder="New Desktop URL" style={{ padding: "10px", background: "#0f172a", color: "#fff", border: "1px solid #334155", borderRadius: "8px" }} />
                        <input type="url" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} placeholder="New Mobile URL" style={{ padding: "10px", background: "#0f172a", color: "#fff", border: "1px solid #334155", borderRadius: "8px" }} />
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={() => handleUpdateLink(item.code)} style={{ padding: "8px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Save</button>
                          <button onClick={() => setEditingCode(null)} style={{ padding: "8px 16px", background: "#64748b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                        <div style={{ wordBreak: "break-all" }}>
                          <a href={`/r?code=${item.code}`} target="_blank" style={{ color: "#38bdf8", fontWeight: "700", fontSize: "16px", textDecoration: "none" }}>{window.location.origin}/r?code={item.code}</a>
                          <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>💻 Desktop: {item.desktopUrl}</div>
                          <div style={{ fontSize: "13px", color: "#94a3b8" }}>📱 Mobile: {item.mobileUrl}</div>
                          <div style={{ fontSize: "13px", color: "#10b981", marginTop: "6px", fontWeight: "600" }}>🔥 Total Clicks: {item.clicks || 0}</div>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/r?code=${item.code}`)} style={{ padding: "8px 12px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Copy</button>
                          <button onClick={() => { setEditingCode(item.code); setEditDesktop(item.desktopUrl); setEditMobile(item.mobileUrl); }} style={{ padding: "8px 12px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Edit</button>
                          <button onClick={() => handleDelete(item.code)} style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div style={{ maxWidth: "850px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px" }}>📈 Live System Analytics</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
              <div style={{ padding: "24px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155" }}>
                <p style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "700", margin: "0 0 8px 0" }}>TOTAL VISITORS</p>
                <h2 style={{ margin: 0, color: "#38bdf8", fontSize: "32px", fontWeight: "800" }}>{stats.totalVisitors}</h2>
              </div>
              <div style={{ padding: "24px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155" }}>
                <p style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "700", margin: "0 0 8px 0" }}>TODAY&apos;S VISITORS</p>
                <h2 style={{ margin: 0, color: "#10b981", fontSize: "32px", fontWeight: "800" }}>{stats.todayVisitors}</h2>
              </div>
              <div style={{ padding: "24px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155" }}>
                <p style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "700", margin: "0 0 8px 0" }}>ACTIVE LINKS</p>
                <h2 style={{ margin: 0, color: "#f59e0b", fontSize: "32px", fontWeight: "800" }}>{stats.totalLinks}</h2>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              <div style={{ padding: "20px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#f8fafc" }}>🌍 Top Countries</h3>
                {Object.keys(stats.countries || {}).length === 0 ? <p style={{ color: "#94a3b8", fontSize: "13px" }}>No data yet</p> : 
                  Object.entries(stats.countries).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><span style={{ color: "#cbd5e1" }}>{k}</span><b>{v}</b></div>)}
              </div>

              <div style={{ padding: "20px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#f8fafc" }}>💻 Devices</h3>
                {Object.keys(stats.devices || {}).length === 0 ? <p style={{ color: "#94a3b8", fontSize: "13px" }}>No data yet</p> : 
                  Object.entries(stats.devices).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><span style={{ color: "#cbd5e1" }}>{k}</span><b>{v}</b></div>)}
              </div>

              <div style={{ padding: "20px", background: "#1e293b", borderRadius: "16px", border: "1px solid #334155" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#f8fafc" }}>🖥️ Platforms / OS</h3>
                {Object.keys(stats.platforms || {}).length === 0 ? <p style={{ color: "#94a3b8", fontSize: "13px" }}>No data yet</p> : 
                  Object.entries(stats.platforms).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><span style={{ color: "#cbd5e1" }}>{k}</span><b>{v}</b></div>)}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
