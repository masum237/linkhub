import Redis from "ioredis";
import bcrypt from "bcryptjs";

const redis = new Redis(process.env.REDIS_URL);

export default function SecretAdminPanel() {
  
  async function handleAddUser(formData) {
    "use server";
    
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) return;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      email: email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await redis.set(`user:${email}`, JSON.stringify(userData));
    console.log(`User ${email} created successfully!`);
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8fafc" }}>
      <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "350px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#1e293b" }}>Secret Admin Panel</h2>
        
        <form action={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input 
            type="email" 
            name="email" 
            placeholder="User Email" 
            required 
            style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "5px", outline: "none" }}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="User Password" 
            required 
            style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "5px", outline: "none" }}
          />
          <button 
            type="submit" 
            style={{ padding: "12px", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
            Create User
          </button>
        </form>
      </div>
    </div>
  );
}
