import { Poppins } from "next/font/google";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata = {
  title: "LinkHub | Smart URL Shortener & Analytics",
  description: "Manage, shorten, and track your links efficiently with LinkHub.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f8fafc", color: "#1e293b", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        {/* সমস্ত পেজের মূল কন্টেন্ট */}
        <div style={{ flex: 1 }}>
          {children}
        </div>

        {/* সব পেজে দেখানোর জন্য কমন ফুটার */}
        <footer style={{ textAlign: "center", padding: "15px", color: "#64748b", fontSize: "13px", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <p style={{ margin: "0 0 3px 0" }}>Copyright © 2026 LinkHub.</p>
          <p style={{ margin: 0 }}>
            Software by{" "}
            <a 
              href="https://t.me/MasumHub" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="https://t.me/MasumHub"
              style={{ color: "#2563eb", textDecoration: "underline", fontWeight: "500" }}
            >
              Masum Ahmed
            </a>
          </p>
        </footer>

      </body>
    </html>
  );
}