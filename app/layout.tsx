import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartBinX - Smart Waste Management",
  description: "Report, Track, Transform. SmartBinX is an innovative platform designed to make waste collection efficient and transparent.",
  icons: {
    icon: [
      { url: "/logo-old.png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/logo-old.png" },
    ],
  },
  openGraph: {
    title: "SmartBinX - Smart Waste Management",
    description: "Report, Track, Transform. SmartBinX is an innovative platform designed to make waste collection efficient and transparent.",
    images: [
      {
        url: "/logo-old.png",
        alt: "SmartBinX Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartBinX - Smart Waste Management",
    description: "Report, Track, Transform. SmartBinX is an innovative platform designed to make waste collection efficient and transparent.",
    images: ["/logo-old.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
