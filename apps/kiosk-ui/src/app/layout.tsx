import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const notoSans = Noto_Sans({ 
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "MediKiosk - Smart Clinical Intake Platform",
  description: "AI-powered clinical history taking & AYUSH triage kiosk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} font-sans`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
