import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Mô phỏng HACUCO",
  description: "Mô phỏng lắp đặt điện mặt trời",
};

export default async function RootLayout({ children }) {
  // Force dynamic rendering by reading headers (bypasses Vercel Edge Cache)
  headers();
  const session = await auth();
  
  return (
    <html lang="vi">
      <body className="antialiased">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
