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
      // নতুন পাথ ফরম্যাট: /r?code=...
      const fullLink = `${window.location.origin}/r?code=${data.code}`;
      setGeneratedLink(fullLink);
      setMessage("🎉 Short link generated!");
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
    if (!confirm("Are you sure?")) return;
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if ((await res.json()).success) fetchStatsAndLinks();
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f7fafc", fontFamily: "sans-serif" }}>
        <form onSubmit={handleLogin} style={{ padding: "40px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "350px" }}>
          <h2>Login</h2>
          <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: "10px", margin: "10px 0" }} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", margin: "10px 0" }} />
          <button type="submit" style={{ width: "100%", padding: "10px", background: "#667eea", color: "#fff", border: "none", cursor: "pointer" }}>Login</button>
          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ width: "250px", background: "#fff", borderRight: "1px solid #ddd", padding: "20px" }}>
        <h3>⚡ QuickURL</h3>
        {["dashboard", "links", "stats"].map(t => (
          <div key={t} onClick={() => setActiveTab(t)} style={{ padding: "10px", cursor: "pointer", background: activeTab === t ? "#edf2f7" : "transparent" }}>{t.toUpperCase()}</div>
        ))}
        <button onClick={() => { localStorage.clear(); location.reload(); }} style={{ marginTop: "20px", color: "red" }}>Logout</button>
      </div>
      <div style={{ flex: 1, padding: "40px" }}>
        {activeTab === "dashboard" && (
          <div>
            <form onSubmit={handleCreateLink} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
              <input type="url" value={desktopUrl} placeholder="Desktop URL" onChange={(e) => setDesktopUrl(e.target.value)} required style={{ padding: "10px" }} />
              <input type="url" value={mobileUrl} placeholder="Mobile URL" onChange={(e) => setMobileUrl(e.target.value)} required style={{ padding: "10px" }} />
              <button type="submit" style={{ padding: "10px", background: "#319795", color: "#fff" }}>Generate</button>
            </form>
            {generatedLink && (
              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <input readOnly value={generatedLink} style={{ flex: 1, padding: "10px" }} />
                <button onClick={handleCopy}>{copyText}</button>
              </div>
            )}
            <p>{message}</p>
          </div>
        )}
        {activeTab === "links" && (
          <div>
            {linksList.map(item => (
              <div key={item.code} style={{ padding: "10px", border: "1px solid #ddd", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                <a href={`/r?code=${item.code}`} target="_blank">{window.location.origin}/r?code={item.code}</a>
                <button onClick={() => handleDelete(item.code)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
