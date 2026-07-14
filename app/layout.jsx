import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ServiceWorkerRegister from "./sw-register";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Mô phỏng HACUCO",
  description: "Mô phỏng lắp đặt điện mặt trời",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HACUCO",
  },
};

export const viewport = {
  themeColor: "#1E3A5F",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }) {
  // Force dynamic rendering by reading headers (bypasses Vercel Edge Cache)
  headers();
  const session = await auth();

  return (
    <html lang="vi">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        <SessionProvider session={session}>{children}</SessionProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
