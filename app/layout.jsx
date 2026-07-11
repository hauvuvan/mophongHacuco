import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Mô phỏng HACUCO",
  description: "Mô phỏng lắp đặt điện mặt trời",
};

export default async function RootLayout({ children }) {
  const session = await auth();
  
  return (
    <html lang="vi">
      <body className="antialiased">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
