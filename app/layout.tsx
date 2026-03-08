import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import ThemeProvider from "@/components/theme-provider"
import StructuredData from "@/components/structuredData"
import ClientLayout from "@/components/ClientLayout"
import PerformanceMonitor from "@/components/PerformanceMonitor"

// --------------------
// Font Configuration
// --------------------
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
  preload: true,
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "500", "600"],
  preload: true,
})

// --------------------
// Metadata
// --------------------
export const metadata: Metadata = {
  title: "Mina Youaness - Full-Stack Developer",
  description:
    "Resume of Mina Youaness, Full-Stack Web Developer with 10+ years of experience in Angular, React, Node.js, and scalable web applications.",
  generator: "Mina Youaness",
  applicationName: "Mina Youaness Resume",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  openGraph: {
    title: "Mina Youaness - Full-Stack Developer",
    description:
      "Resume of Mina Youaness, Full-Stack Web Developer with 10+ years of experience in Angular, React, Node.js, and scalable web applications.",
    url: "https://MYouaness-Rad.github.io/",
    siteName: "Mina Youaness Resume",
    images: [
      {
        url: "https://MYouaness-Rad.github.io/images/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Mina Youaness Resume",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  keywords: [
    "Mina Youaness",
    "Full-Stack Developer",
    "Web Developer",
    "Angular",
    "React",
    "Node.js",
    "TypeScript",
    "Web Development",
    "Resume",
    "Portfolio",
    "Professional Resume",
    "Software Engineer",
    "Web Applications",
    "Frontend Development",
    "Backend Development"],
  authors: [{ name: "Mina Youaness", url: "https://MYouaness-Rad.github.io/" }],
  creator: "Mina Youaness",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

// --------------------
// Root Layout
// --------------------
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClientLayout>{children}</ClientLayout>
          <PerformanceMonitor />
        </ThemeProvider>
        <StructuredData />
      </body>
    </html>
  )
}
