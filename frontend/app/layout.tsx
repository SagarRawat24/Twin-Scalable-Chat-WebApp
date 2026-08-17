import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import Providers from "./provider"; // ✅ use this
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}