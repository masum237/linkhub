"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copyText, setCopyText] = useState("Copy");

  // আগের লগইন এবং অন্যান্য স্টেট ঠিক থাকবে...
  // শুধু handleCreateLink এর ভেতর কপি ফিচার ও UI আপডেট করছি
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy"), 2000);
  };

  // ... (বাকি আগের সব ফাংশন ঠিক থাকবে)

  return (
    <div style={{ padding: "20px", maxWidth: "100%", width: "95%", margin: "auto" }}>
      {/* রেসপন্সিভ কার্ড ডিজাইন */}
      <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <h3>Create Short Link</h3>
        {/* ইনপুট ফিল্ডগুলো... */}
        
        {generatedLink && (
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input readOnly value={generatedLink} style={{ flex: 1, padding: "10px", border: "1px solid #ccc" }} />
            <button onClick={handleCopy} style={{ padding: "10px 20px", background: "#3182ce", color: "white", border: "none", cursor: "pointer" }}>
              {copyText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
