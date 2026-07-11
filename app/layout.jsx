import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Mô phỏng HACUCO",
  description: "Mô phỏng lắp đặt điện mặt trời",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
