import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solana Block Counter",
  description: "Get transaction counts for any Solana block with our high-performance NestJS API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
