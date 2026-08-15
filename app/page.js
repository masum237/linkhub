"use client";
import { useState } from "react";

export default function Dashboard() {
  const [subdomain, setSubdomain] = useState("");
  const [desktopUrl, setDesktopUrl] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [message, setMessage] = useState("");

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

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f8f9fa" }}>
      
      {/* Sidebar - স্ক্রিনশটের মত বেসিক ডিজাইন */}
      <div style={{ width: "250px", backgroundColor: "#fff", padding: "20px", borderRight: "1px solid #ddd" }}>
        <h2 style={{ color: "#007bff", marginBottom: "30px" }}>🚀 QuickURL</h2>
        <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.5" }}>
          <li style={{ fontWeight: "bold", color: "#333", backgroundColor: "#e9ecef", padding: "5px 10px", borderRadius: "5px" }}>📊 Dashboard</li>
          <li style={{ color: "#666", padding: "5px 10px" }}>🔗 Short Links</li>
          <li style={{ color: "#666", padding: "5px 10px" }}>📈 Statistics</li>
          <li style={{ color: "#666", padding: "5px 10px" }}>🌐 Domain Settings</li>
        </ul>
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
