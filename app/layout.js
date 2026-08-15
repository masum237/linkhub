import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "LinkHub | Smart URL Shortener & Analytics",
  description: "Manage, shorten, and track your links efficiently with LinkHub.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={montserrat.className}>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f8fafc", color: "#1e293b" }}>
        {children}
      </body>
    </html>
  );
}
