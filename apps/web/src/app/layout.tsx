import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UmrohHub — Marketplace Umroh & Portal Verifikasi Kemenag RI",
    template: "%s | UmrohHub",
  },
  description:
    "Platform marketplace paket umroh resmi dari biro perjalanan PPIU terakreditasi Kemenag RI. Dilengkapi sistem verifikasi paspor 5 Pasti Umroh, kepastian kuota penerbangan, dan jaminan transparansi harga.",
  keywords: [
    "umroh",
    "marketplace umroh",
    "paket umroh kemenag",
    "biro umroh resmi",
    "ppiu terpercaya",
    "verifikasi paspor umroh",
    "umroh bintang 5",
    "umroh ramadhan",
  ],
  authors: [{ name: "UmrohHub Enterprise" }],
  creator: "UmrohHub",
  publisher: "UmrohHub",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "UmrohHub — Marketplace Umroh & Portal Verifikasi Kemenag RI",
    description:
      "Temukan dan pesan paket umroh berizin resmi Kemenag RI dengan verifikasi paspor digital dan jaminan 5 Pasti Umroh.",
    siteName: "UmrohHub",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UmrohHub — Marketplace Umroh Terverifikasi Kemenag RI",
    description:
      "Platform marketplace resmi paket umroh terakreditasi Kemenag RI dengan validasi paspor dan manifest digital.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
