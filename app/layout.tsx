import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-heebo-next",
  display: "swap",
});

export const metadata: Metadata = {
  title: "קייטרינג פיצה אילת",
  description: "מסעדת פיצה וקייטרינג באילת",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body style={{ margin: 0, paddingBottom: 70, background: "#0a0a0a", color: "white" }}>
        {children}
      </body>
    </html>
  );
}
