import Redis from "ioredis";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const redis = new Redis(process.env.REDIS_URL);

export default async function DashboardPage() {
  const cookieStore = cookies();
  const userEmail = cookieStore.get("user_email")?.value;

  if (!userEmail) {
    redirect("/login");
  }

  async function createShortLink(formData) {
    "use server";
    
    const longUrl = formData.get("longUrl");
    const shortCode = Math.random().toString(36).substring(2, 8);

    const linkData = {
      shortCode,
      longUrl,
      createdAt: new Date().toISOString(),
    };

    await redis.rpush(`links:${userEmail}`, JSON.stringify(linkData));
    redirect("/dashboard");
  }

  const rawLinks = await redis.lrange(`links:${userEmail}`, 0, -1);
  const userLinks = rawLinks.map((item) => JSON.parse(item));

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto", padding: "20px" }}>
      <h2>Welcome, {userEmail}</h2>
      <p style={{ color: "#64748b" }}>Here are your personal shortened links.</p>

      <form action={createShortLink} style={{ display: "flex", gap: "10px", margin: "30px 0" }}>
        <input 
          type="url" 
          name="longUrl" 
          placeholder="Paste your long URL here..." 
          required 
          style={{ flex: 1, padding: "12px", border: "1px solid #cbd5e1", borderRadius: "5px" }}
        />
        <button 
          type="submit" 
          style={{ padding: "12px 20px", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Shorten Link
        </button>
      </form>

      <h3>Your Links ({userLinks.length})</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
        {userLinks.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No links created yet.</p>
        ) : (
          userLinks.map((link, index) => (
            <div key={index} style={{ padding: "15px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 5px 0", fontWeight: "bold", color: "#2563eb" }}>Code: {link.shortCode}</p>
                <p style={{ margin: 0, fontSize: "14px", color: "#64748b", wordBreak: "break-all" }}>{link.longUrl}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
