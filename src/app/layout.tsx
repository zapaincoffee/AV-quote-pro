import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AV Quote Pro",
  description: "Create and manage AV quotes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
