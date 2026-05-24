import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "קייטרינג פיצה אילת", description: "מסעדת פיצה וקייטרינג באילת" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&display=swap" rel="stylesheet"/>
      </head>
      <body style={{fontFamily:"'Heebo',sans-serif",background:"#0a0a0a",color:"white",margin:0,paddingBottom:70}}>
        {children}
      </body>
    </html>
  );
}
