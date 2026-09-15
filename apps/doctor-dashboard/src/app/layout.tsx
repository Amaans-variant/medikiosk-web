import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { THEME_STORAGE_KEY } from "@/store/themeStore";

const notoSans = Noto_Sans({ 
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "MediKiosk - Smart Clinical Intake Platform",
  description: "AI-powered clinical history taking & AYUSH triage kiosk",
};

// Runs synchronously before first paint so the correct theme class is
// already on <html> when React hydrates — avoids a light-mode "flash"
// for users who previously chose Dark Mode. Reads the exact same
// localStorage key the persisted theme store (store/themeStore.ts)
// uses, so the two never disagree.
const noFlashThemeScript = `
(function() {
  try {
    var raw = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme = raw ? JSON.parse(raw).state.theme : "light";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className={`${notoSans.variable} font-sans`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
