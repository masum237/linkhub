import Redis from "ioredis";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const redis = new Redis(process.env.REDIS_URL);

export default function LoginPage() {
  
  async function handleLogin(formData) {
    "use server";
    
    const email = formData.get("email");
    const password = formData.get("password");

    const userDataStr = await redis.get(`user:${email}`);
    if (!userDataStr) return;

    const userData = JSON.parse(userDataStr);
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) return;

    cookies().set("user_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    redirect("/dashboard");
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8fafc" }}>
      <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "350px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#1e293b" }}>Login to LinkHub</h2>
        
        <form action={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input 
            type="email" 
            name="email" 
            placeholder="Your Email" 
            required 
            style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "5px", outline: "none" }}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Your Password" 
            required 
            style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "5px", outline: "none" }}
          />
          <button 
            type="submit" 
            style={{ padding: "12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
