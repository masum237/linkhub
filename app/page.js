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
  const [copyText, setCopyText] = useState("Copy");

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchStatsAndLinks();
    }
  }, [isLoggedIn]);

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
      localStorage.setItem("isLoggedIn", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
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
      // এখানে নতুন রিডাইরেক্ট পাথ সেট করা হয়েছে
      const fullLink = `${window.location.origin}/api/r/${data.code}`;
      setGeneratedLink(fullLink);
      setMessage("🎉 Short link generated successfully!");
      setDesktopUrl("");
      setMobileUrl("");
      fetchStatsAndLinks();
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy"), 2000);
  };

  const handleDelete = async (code) => {
    if (!confirm(`Are you sure you want to delete this link?`)) return;
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if ((await res.json()).success) fetchStatsAndLinks();
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: "#ffffff", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", width: "100%", maxWidth: "420px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>⚡ QuickURL</h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }} />
            <button type="submit" style={{ padding: "13px", background: "#667eea", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: "#f7fafc" }}>
      <div style={{ width: "260px", backgroundColor: "#fff", padding: "24px", borderRight: "1px solid #e2e8f0" }}>
        <h2 style={{ marginBottom: "35px" }}>⚡ QuickURL</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {["dashboard", "links", "stats"].map((t) => (
            <li key={t} onClick={() => setActiveTab(t)} style={{ padding: "12px", cursor: "pointer", color: activeTab === t ? "#667eea" : "#4a5568", backgroundColor: activeTab === t ? "#ebf4ff" : "transparent", borderRadius: "8px", marginBottom: "8px" }}>{t.toUpperCase()}</li>
          ))}
        </ul>
        <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px", width: "100%", background: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7", borderRadius: "8px", cursor: "pointer" }}>Logout</button>
      </div>

      <div style={{ flex: 1, padding: "40px" }}>
        {activeTab === "dashboard" && (
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", maxWidth: "700px" }}>
            <form onSubmit={handleCreateLink} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <input type="url" value={desktopUrl} onChange={(e) => setDesktopUrl(e.target.value)} placeholder="Desktop URL" required style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e0", borderRadius: "8px" }} />
              <input type="url" value={mobileUrl} onChange={(e) => setMobileUrl(e.target.value)} placeholder="Mobile URL" required style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e0", borderRadius: "8px" }} />
              <button type="submit" style={{ padding: "14px", background: "#319795", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Generate Link</button>
            </form>
            {generatedLink && (
              <div style={{ marginTop: "20px", padding: "10px", background: "#edf2f7", display: "flex", gap: "10px", alignItems: "center" }}>
                <input readOnly value={generatedLink} style={{ flex: 1, padding: "8px" }} />
                <button onClick={handleCopy} style={{ padding: "8px 16px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "6px" }}>{copyText}</button>
              </div>
            )}
            {message && <p style={{ marginTop: "15px" }}>{message}</p>}
          </div>
        )}
        {activeTab === "links" && (
          <div>
            {linksList.map((item, idx) => (
              <div key={idx} style={{ padding: "16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                <a href={`/api/r/${item.code}`} target="_blank" style={{ color: "#3182ce" }}>{window.location.origin}/api/r/{item.code}</a>
                <button onClick={() => handleDelete(item.code)} style={{ background: "#feb2b2", border: "none", padding: "5px 10px", cursor: "pointer" }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
