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
    default: "Umrohpedia — Marketplace Umroh & Portal Verifikasi Kemenag RI",
    template: "%s | Umrohpedia",
  },
  description:
    "Platform marketplace paket umroh resmi dari biro perjalanan PPIU terakreditasi Kemenag RI. Dilengkapi sistem verifikasi paspor 5 Pasti Umroh, kepastian kuota penerbangan, dan jaminan transparansi harga dengan Rekening Escrow Syariah.",
  keywords: [
    "umrohpedia",
    "umroh",
    "marketplace umroh",
    "paket umroh kemenag",
    "biro umroh resmi",
    "ppiu terpercaya",
    "verifikasi paspor umroh",
    "umroh bintang 5",
    "umroh ramadhan",
    "tabungan umroh escrow",
  ],
  authors: [{ name: "Umrohpedia" }],
  creator: "Umrohpedia",
  publisher: "Umrohpedia",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Umrohpedia — Marketplace Umroh & Portal Verifikasi Kemenag RI",
    description:
      "Temukan dan pesan paket umroh berizin resmi Kemenag RI dengan verifikasi paspor digital dan jaminan 5 Pasti Umroh.",
    siteName: "Umrohpedia",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Umrohpedia — Marketplace Umroh Terverifikasi Kemenag RI",
    description:
      "Platform marketplace resmi paket umroh terakreditasi Kemenag RI dengan validasi paspor dan manifest digital.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
