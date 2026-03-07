"use client";

import Script from "next/script";

// This client component ensures the structured data is reliably rendered on the client side
// for better crawling and SEO.
export default function StructuredData() {
  return (
    <Script
      id="person-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Mina Youaness",
          url: "https://MYouaness-Rad.github.io/",
          sameAs: [
            "https://github.com/MYouaness-Rad",
            "https://www.linkedin.com/in/minayouaness/",
          ],
          jobTitle: "Full-Stack Developer",
          worksFor: { "@type": "Organization", name: "Self-Employed" },
        }),
      }}
    />
  );
}
