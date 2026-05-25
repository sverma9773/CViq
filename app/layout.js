import "./globals.css";
import { AuthContextProvider } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import ClientLayoutWrapper from "./components/ClientLayoutWrapper";

export const metadata = {
  metadataBase: new URL("https://cviqly.com"),
  title: "Free AI Resume Builder & ATS Resume Checker",
  description:
    "Create ATS-friendly resumes in minutes with CViqly AI Resume Builder. Free modern resume templates, AI suggestions, PDF export & resume score checker.",
  keywords: "AI resume builder, ATS resume checker, resume builder free, resume maker online, CV builder, resume templates, professional resume builder",
  alternates: {
    canonical: "https://cviqly.com/",
  },
  openGraph: {
    title: "CViqly - AI Resume Builder",
    description: "Create job-winning ATS-friendly resumes with AI.",
    type: "website",
    url: "https://cviqly.com/",
    siteName: "CViqly",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CViqly — The Elegant AI Resume Builder & ATS Checker",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CViqly - AI Resume Builder",
    description: "Create job-winning ATS-friendly resumes with AI.",
    images: ["/og-image.png"],
    creator: "@cviqly",
  },
  robots: "index, follow",
};

export default function RootLayout({ children }) {
  const applicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CViqly",
    "url": "https://cviqly.com",
    "logo": "https://cviqly.com/logo.png",
    "image": "https://cviqly.com/og-image.png",
    "description": "Create stunning, ATS-friendly resumes for free with CViqly. Analyze your resume with our advanced ATS Checker, customize styles with real-time editing, and export premium PDFs.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5, CSS3, and JavaScript.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1240"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Priya Sharma"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "CViqly made creating my resume incredibly simple. The real-time preview is a game-changer — I could see exactly how my resume would look as I typed."
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Alex Johnson"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "I've tried several resume builders, but this one stands out. The design is elegant and the templates are truly professional. Landed 3 interviews in a week!"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Maria Rodriguez"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "Beautiful interface, intuitive to use, and the PDF output is pixel-perfect. As a designer, I appreciate the attention to detail in every aspect of this tool."
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is CViqly really free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Your first resume is 100% free forever. No trial period, no credit card required, and no auto-upgrades. You can create, edit, and download your resume as many times as you want."
        }
      },
      {
        "@type": "Question",
        "name": "Are the resumes ATS-friendly?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. CViqly exports clean, text-based PDFs with embedded fonts and a simple structure that Applicant Tracking Systems can read without any issues. Focus on clear headings, relevant keywords, and impact-focused bullet points."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download my resume as a PDF?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can download your resume as a high-quality PDF at any time. There are no download limits — update and download as often as you like."
        }
      },
      {
        "@type": "Question",
        "name": "Do you add watermarks to my resume?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Never. Your resume is your space to shine. We don't add any branding, logos, or watermarks to your documents."
        }
      },
      {
        "@type": "Question",
        "name": "How does the real-time preview work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "As you type in the editor sidebar, your changes appear instantly in the resume preview panel. This gives you immediate visual feedback, so you can fine-tune every detail before downloading."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data safe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Your resume data is stored locally in your browser using localStorage. We don't send your personal data to any server, and you can delete it anytime by clearing your browser data."
        }
      },
      {
        "@type": "Question",
        "name": "How does the built-in ATS resume checker calculate my score?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our advanced ATS resume checker analyzes your resume content against common hiring algorithms. It audits key features like keyword density, structural layout, heading hierarchies, contact details, and standard font compatibility. Once checked, it outputs an interactive resume score and an actionable optimization list to maximize compatibility before you submit your application."
        }
      },
      {
        "@type": "Question",
        "name": "How does CViqly optimize resumes for AI search & Answer Engines (AEO & GEO)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "With the rise of generative AI search engines and AI recruiters, Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) are critical. CViqly is built specifically to address this shift. By exporting structured, machine-readable text and clean headings, we ensure that AI-driven parsers and search bots can seamlessly interpret, catalog, and query your credentials, boosting your search visibility."
        }
      },
      {
        "@type": "Question",
        "name": "Why should I use an online AI resume builder instead of Word or Canva?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Many visual editors like Canva export resumes as flat image sheets or contain complex overlapping text grids that confuse Applicant Tracking Systems (ATS) and search engine web crawlers. CViqly utilizes structured, semantic layouts and standard PDF fonts, guaranteeing that indexing bots and candidate database crawlers can read 100% of your career experience and skill keywords."
        }
      }
    ]
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://cviqly.com/"
      }
    ]
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CViqly",
    "url": "https://cviqly.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cviqly.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <AuthContextProvider>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
          <AuthModal />
        </AuthContextProvider>
      </body>
    </html>
  );
}
