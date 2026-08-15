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
  
  // Create Link Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [desktopUrl, setDesktopUrl] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [message, setMessage] = useState("");

  // Edit State
  const [editingLink, setEditingLink] = useState(null);
  const [editDesktop, setEditDesktop] = useState("");
  const [editMobile, setEditMobile] = useState("");

  // Single Link Stats Modal State
  const [selectedLinkStats, setSelectedLinkStats] = useState(null);

  // Three-dot Menu Open State
  const [openMenuCode, setOpenMenuCode] = useState(null);

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
    if (username === "masumhub" && password === "masumhub") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password!");
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setMessage("Generating...");
    const res = await fetch("/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desktopUrl, mobileUrl }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Success!");
      setDesktopUrl("");
      setMobileUrl("");
      setShowCreateModal(false);
      fetchStatsAndLinks();
    } else {
      setMessage(`Error: ${data.error}`);
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
      setEditingLink(null);
      fetchStatsAndLinks();
    } else {
      alert("Failed to update");
    }
  };

  const handleDelete = async (code) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    fetchStatsAndLinks();
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
        <form onSubmit={handleLogin} style={{ padding: "40px", background: "#ffffff", borderRadius: "16px", width: "380px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <h2 style={{ color: "#0f172a", fontSize: "24px", fontWeight: "800", margin: "0 0 5px 0" }}>🔗 LinkHub</h2>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Smart URL Shortener & Analytics</p>
          </div>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: "100%", padding: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "8px", marginBottom: "15px", boxSizing: "border-box", outline: "none" }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "8px", marginBottom: "20px", boxSizing: "border-box", outline: "none" }} />
          <button type="submit" style={{ width: "100%", padding: "12px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Login to LinkHub</button>
          {loginError && <p style={{ color: "#ef4444", marginTop: "12px", fontSize: "13px", textAlign: "center" }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: "#f8fafc", color: "#1e293b" }}>
      
      {/* Left Sidebar */}
      <div style={{ width: "260px", background: "#ffffff", borderRight: "1px solid #e2e8f0", padding: "24px 20px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "35px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0d9488", margin: 0 }}>🔗 LinkHub</h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "links", label: "🔗 Short Links" },
            { id: "stats", label: "📈 Statistics" }
          ].map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "12px 16px", cursor: "pointer", borderRadius: "10px", fontWeight: "600", fontSize: "14px", background: activeTab === t.id ? "#ccfbf1" : "transparent", color: activeTab === t.id ? "#0f766e" : "#64748b" }}>{t.label}</div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Masum</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>masumhub@gmail.com</div>
          </div>
          <button onClick={() => { localStorage.clear(); sessionStorage.clear(); location.reload(); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Logout</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "40px", boxSizing: "border-box", overflowY: "auto" }}>
        
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
              <div style={{ padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "700", margin: "0 0 8px 0" }}>TOTAL LINKS</p>
                <h2 style={{ margin: 0, color: "#0f172a", fontSize: "28px", fontWeight: "800" }}>{stats.totalLinks}</h2>
              </div>
              <div style={{ padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "700", margin: "0 0 8px 0" }}>TOTAL VISITORS</p>
                <h2 style={{ margin: 0, color: "#0f172a", fontSize: "28px", fontWeight: "800" }}>{stats.totalVisitors}</h2>
              </div>
              <div style={{ padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "700", margin: "0 0 8px 0" }}>DAILY VISITORS</p>
                <h2 style={{ margin: 0, color: "#0f172a", fontSize: "28px", fontWeight: "800" }}>{stats.todayVisitors}</h2>
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "25px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "40px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ height: "180px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#94a3b8", fontSize: "14px" }}>
                  📊 Analytics Chart ({stats.totalVisitors} Total Visitors Recorded)
                </div>
              </div>
              <p style={{ color: "#64748b", fontSize: "12px", margin: "15px 0 0 0" }}>ℹ️ Chart automatically refreshes. Data from active tracking.</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#0f172a" }}>Recent Links</h3>
              <button onClick={() => setShowCreateModal(true)} style={{ padding: "10px 20px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>+ Create link</button>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: "600", fontSize: "14px", color: "#64748b" }}>Link</div>
              {linksList.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No links created yet.</div>
              ) : (
                linksList.slice(0, 5).map(item => (
                  <div key={item.code} style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ wordBreak: "break-all" }}>
                      <a href={`/r?code=${item.code}`} target="_blank" style={{ color: "#0d9488", fontWeight: "700", fontSize: "15px", textDecoration: "none" }}>{window.location.origin}/r?code={item.code}</a>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>💻 {item.desktopUrl}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", color: "#334155" }}>🔥 {item.clicks || 0}</span>
                      <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/r?code=${item.code}`)} title="Copy Link" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 10px", borderRadius: "6px", cursor: "pointer" }}>📋</button>
                      <button onClick={() => handleDelete(item.code)} title="Delete Link" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 10px", borderRadius: "6px", cursor: "pointer" }}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Short Links Tab (Dedicated Page) */}
        {activeTab === "links" && (
          <div style={{ maxWidth: "900px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 5px 0", color: "#0f172a" }}>Short Links</h2>
                <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Total Links Created: <b>{linksList.length}</b></p>
              </div>
              <button onClick={() => setShowCreateModal(true)} style={{ padding: "10px 18px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>+ New Link</button>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: "600", fontSize: "14px", color: "#64748b" }}>All Links Directory</div>
              {linksList.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No short links found. Click &quot;+ New Link&quot; to create one.</div>
              ) : (
                linksList.map(item => (
                  <div key={item.code} style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                    <div style={{ wordBreak: "break-all" }}>
                      <a href={`/r?code=${item.code}`} target="_blank" style={{ color: "#0d9488", fontWeight: "700", fontSize: "16px", textDecoration: "none" }}>{window.location.origin}/r?code={item.code}</a>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>💻 Desktop: {item.desktopUrl}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>📱 Mobile: {item.mobileUrl}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {/* Click Badge */}
                      <span style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                        🔥 {item.clicks || 0} Clicks
                      </span>

                      {/* Copy Icon */}
                      <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/r?code=${item.code}`)} title="Copy" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 10px", borderRadius: "6px", cursor: "pointer" }}>📋</button>
                      
                      {/* Delete Icon */}
                      <button onClick={() => handleDelete(item.code)} title="Delete" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 10px", borderRadius: "6px", cursor: "pointer" }}>🗑️</button>

                      {/* Three-dot menu */}
                      <div style={{ position: "relative" }}>
                        <button onClick={() => setOpenMenuCode(openMenuCode === item.code ? null : item.code)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>⋮</button>
                        
                        {openMenuCode === item.code && (
                          <div style={{ position: "absolute", right: 0, top: "40px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, width: "130px", overflow: "hidden" }}>
                            <button onClick={() => { setEditingLink(item); setEditDesktop(item.desktopUrl); setEditMobile(item.mobileUrl); setOpenMenuCode(null); }} style={{ width: "100%", padding: "10px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#1e293b", borderBottom: "1px solid #f1f5f9" }}>✏️ Edit</button>
                            <button onClick={() => { setSelectedLinkStats(item); setOpenMenuCode(null); }} style={{ width: "100%", padding: "10px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#1e293b" }}>📊 Statistics</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div style={{ maxWidth: "850px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "25px", color: "#0f172a" }}>📈 Live System Analytics</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
              <div style={{ padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "700", margin: "0 0 8px 0" }}>TOTAL VISITORS</p>
                <h2 style={{ margin: 0, color: "#0d9488", fontSize: "32px", fontWeight: "800" }}>{stats.totalVisitors}</h2>
              </div>
              <div style={{ padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "700", margin: "0 0 8px 0" }}>TODAY&apos;S VISITORS</p>
                <h2 style={{ margin: 0, color: "#0f766e", fontSize: "32px", fontWeight: "800" }}>{stats.todayVisitors}</h2>
              </div>
              <div style={{ padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "700", margin: "0 0 8px 0" }}>ACTIVE LINKS</p>
                <h2 style={{ margin: 0, color: "#f59e0b", fontSize: "32px", fontWeight: "800" }}>{stats.totalLinks}</h2>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              <div style={{ padding: "20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#0f172a" }}>🌍 Top Countries</h3>
                {Object.keys(stats.countries || {}).length === 0 ? <p style={{ color: "#64748b", fontSize: "13px" }}>No data yet</p> : 
                  Object.entries(stats.countries).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><span style={{ color: "#334155" }}>{k}</span><b>{v}</b></div>)}
              </div>

              <div style={{ padding: "20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#0f172a" }}>💻 Devices</h3>
                {Object.keys(stats.devices || {}).length === 0 ? <p style={{ color: "#64748b", fontSize: "13px" }}>No data yet</p> : 
                  Object.entries(stats.devices).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><span style={{ color: "#334155" }}>{k}</span><b>{v}</b></div>)}
              </div>

              <div style={{ padding: "20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#0f172a" }}>🖥️ Platforms / OS</h3>
                {Object.keys(stats.platforms || {}).length === 0 ? <p style={{ color: "#64748b", fontSize: "13px" }}>No data yet</p> : 
                  Object.entries(stats.platforms).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><span style={{ color: "#334155" }}>{k}</span><b>{v}</b></div>)}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", padding: "30px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#0f172a" }}>Create New Link</h3>
            <form onSubmit={handleCreateLink} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Desktop URL</label>
                <input type="url" value={desktopUrl} onChange={(e) => setDesktopUrl(e.target.value)} placeholder="https://example.com" required style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Mobile URL</label>
                <input type="url" value={mobileUrl} onChange={(e) => setMobileUrl(e.target.value)} placeholder="https://example.com" required style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>Generate</button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: "12px 20px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              </div>
              {message && <p style={{ textAlign: "center", fontSize: "13px", color: "#0d9488" }}>{message}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingLink && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", padding: "30px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#0f172a" }}>Edit Link: {editingLink.code}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Desktop URL</label>
                <input type="url" value={editDesktop} onChange={(e) => setEditDesktop(e.target.value)} style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Mobile URL</label>
                <input type="url" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button onClick={() => handleUpdateLink(editingLink.code)} style={{ flex: 1, padding: "12px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>Save Changes</button>
                <button onClick={() => setEditingLink(null)} style={{ padding: "12px 20px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal (from 3-dot menu) */}
      {selectedLinkStats && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", padding: "30px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", maxHeight: "85vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#0f172a", fontSize: "20px" }}>📊 Link Statistics</h3>
            <p style={{ fontSize: "13px", color: "#64748b", wordBreak: "break-all", marginBottom: "15px" }}><b>Link:</b> {window.location.origin}/r?code={selectedLinkStats.code}</p>
            <p style={{ fontSize: "16px", color: "#0d9488", marginBottom: "20px", fontWeight: "700" }}>🔥 Total Clicks: {selectedLinkStats.clicks || 0}</p>
            
            {/* Countries */}
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ fontSize: "14px", color: "#0f172a", marginBottom: "8px" }}>🌍 Countries:</h4>
              {Object.keys(selectedLinkStats.countries || {}).length === 0 ? <p style={{ fontSize: "12px", color: "#64748b" }}>No data</p> :
                Object.entries(selectedLinkStats.countries).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}><span style={{ color: "#334155" }}>{k}</span><b>{v}</b></div>)}
            </div>

            {/* Devices */}
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ fontSize: "14px", color: "#0f172a", marginBottom: "8px" }}>💻 Devices:</h4>
              {Object.keys(selectedLinkStats.devices || {}).length === 0 ? <p style={{ fontSize: "12px", color: "#64748b" }}>No data</p> :
                Object.entries(selectedLinkStats.devices).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}><span style={{ color: "#334155" }}>{k}</span><b>{v}</b></div>)}
            </div>

            {/* Platforms */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "14px", color: "#0f172a", marginBottom: "8px" }}>🖥️ Platforms / OS:</h4>
              {Object.keys(selectedLinkStats.platforms || {}).length === 0 ? <p style={{ fontSize: "12px", color: "#64748b" }}>No data</p> :
                Object.entries(selectedLinkStats.platforms).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}><span style={{ color: "#334155" }}>{k}</span><b>{v}</b></div>)}
            </div>

            <button onClick={() => setSelectedLinkStats(null)} style={{ width: "100%", padding: "12px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
