export const metadata = {
  title: 'LinkHub | Smart URL Shortener & Analytics',
  description: 'Manage, shorten, and track your links efficiently with LinkHub.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
