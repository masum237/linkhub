export const metadata = {
  title: "LinkHub | Smart URL Shortener",
  description: "Smart URL Shortener & Analytics",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
