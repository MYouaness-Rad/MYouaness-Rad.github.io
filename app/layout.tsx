import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";
import StructuredData from "@/components/structuredData";

// --------------------
// Font Configuration
// --------------------
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "500", "600"],
});

// --------------------
// Metadata
// --------------------
export const metadata: Metadata = {
  title: "Mina Youaness - Full-Stack Developer",
  description:
    "Resume of Mina Youaness, Full-Stack Web Developer with 10+ years of experience in Angular, React, Node.js, and scalable web applications.",
  generator: "Mina Youaness",
  applicationName: "Mina Youaness Resume",

  openGraph: {
    title: "Mina Youaness - Full-Stack Developer",
    description:
      "Resume of Mina Youaness, Full-Stack Web Developer with 10+ years of experience in Angular, React, Node.js, and scalable web applications.",
    url: "https://MYouaness-Rad.github.io/",
    siteName: "Mina Youaness Resume",
    images: [
      {
        url: "/images/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Mina Youaness Resume",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },

  keywords: [
    "Mina Youaness",
    "Full-Stack Developer",
    "Web Developer",
    "Angular",
    "React",
    "Node.js",
    "TypeScript",
    "Frontend Development",
    "Backend Development",
    "Resume",
    "Portfolio",
    "Software Engineer",
    "Web Applications",
  ],

  authors: [{ name: "Mina Youaness", url: "https://MYouaness-Rad.github.io/" }],
  creator: "Mina Youaness",
};

// --------------------
// Viewport Configuration
// --------------------
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};


// --------------------
// Root Layout
// --------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSans.variable}`}
      suppressHydrationWarning
    >
    {/* JSON-LD Structured Data - Placed directly in the HTML without `next/head` */}
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Mina Youaness",
            url: "https://MYouaness-Rad.github.io/",
            sameAs: [
              "https://github.com/MYouaness-Rad",
              "https://www.linkedin.com/in/mina-youaness-ba833713/",
            ],
            jobTitle: "Full-Stack Developer",
            worksFor: { "@type": "Organization", name: "Self-Employed" },
          }),
        }}
      />
      <body className="font-sans antialiased transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>

          {children}
        </ThemeProvider>
        <StructuredData />
      </body>
    </html>
  );
}
