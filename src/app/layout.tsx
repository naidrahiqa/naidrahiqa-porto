import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CursorGlow } from "@/components/CursorGlow";
import { ScrollProgress } from "@/components/ScrollProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Naidrahiqa",
    template: "%s - Naidrahiqa",
  },
  description:
    "Faqih Ardian Syah - Networking Student | Kernel Developer | IoT Builder | CyberSecurity Enthusiast",
  keywords: [
    "Faqih Ardian Syah",
    "Naidrahiqa",
    "kernel developer",
    "IoT",
    "cybersecurity",
    "CTF",
    "TKJ",
  ],
  openGraph: {
    title: "Naidrahiqa - Faqih Ardian Syah",
    description:
      "TKJ Student, Kernel Developer, IoT Builder, and CyberSecurity Enthusiast. Portfolio and school project showcase.",
    type: "website",
    siteName: "Naidrahiqa",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naidrahiqa - Faqih Ardian Syah",
    description:
      "TKJ Student, Kernel Developer, IoT Builder, and CyberSecurity Enthusiast.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeInit = `
try {
  var t = localStorage.getItem("theme");
  if (t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="noise min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-background"
        >
          Skip to content
        </a>
        <CursorGlow />
        <ScrollProgress />
        <div className="grid-bg pointer-events-none fixed inset-0 -z-10" />
        <div className="dot-grid pointer-events-none fixed inset-0 -z-10 opacity-15" />
        <Navbar />
        <main
          id="main"
          className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 pb-20 page-enter"
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}