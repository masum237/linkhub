import { Poppins } from "next/font/google";

// Poppins ফন্টের জন্য ওয়েইট (weight) উল্লেখ করে দেওয়া হলো
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
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f8fafc", color: "#1e293b" }}>
        {children}
      </body>
    </html>
  );
}
