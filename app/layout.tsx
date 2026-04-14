import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Allegory — Understand anything, in your own language",
  description: "An AI explanation engine that translates complex concepts through the things you already love.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
