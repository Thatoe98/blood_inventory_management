import type { Metadata } from "next";
import AuthWrapper from "@/components/AuthWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blood Inventory Management System",
  description: "Blood bank inventory and donor management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
