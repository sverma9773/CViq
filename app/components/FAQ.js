"use client";

import { useState } from "react";
import { ClaudePlus } from "./ClaudeIcon";

const faqs = [
  {
    question: "Is CViqly really free?",
    answer:
      "Yes! Your first resume is 100% free forever. No trial period, no credit card required, and no auto-upgrades. You can create, edit, and download your resume as many times as you want.",
  },
  {
    question: "Are the resumes ATS-friendly?",
    answer:
      "Absolutely. CViqly exports clean, text-based PDFs with embedded fonts and a simple structure that Applicant Tracking Systems can read without any issues. Focus on clear headings, relevant keywords, and impact-focused bullet points.",
  },
  {
    question: "Can I download my resume as a PDF?",
    answer:
      "Yes! You can download your resume as a high-quality PDF at any time. There are no download limits — update and download as often as you like.",
  },
  {
    question: "Do you add watermarks to my resume?",
    answer:
      "Never. Your resume is your space to shine. We don't add any branding, logos, or watermarks to your documents.",
  },
  {
    question: "How does the real-time preview work?",
    answer:
      "As you type in the editor sidebar, your changes appear instantly in the resume preview panel. This gives you immediate visual feedback, so you can fine-tune every detail before downloading.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. Your resume data is stored locally in your browser using localStorage. We don't send your personal data to any server, and you can delete it anytime by clearing your browser data.",
  },
  {
    question: "How does the built-in ATS resume checker calculate my score?",
    answer:
      "Our advanced ATS resume checker analyzes your resume content against common hiring algorithms. It audits key features like keyword density, structural layout, heading hierarchies, contact details, and standard font compatibility. Once checked, it outputs an interactive resume score and an actionable optimization list to maximize compatibility before you submit your application.",
  },
  {
    question: "How does CViqly optimize resumes for AI search & Answer Engines (AEO & GEO)?",
    answer:
      "With the rise of generative AI search engines and AI recruiters, Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) are critical. CViqly is built specifically to address this shift. By exporting structured, machine-readable text and clean headings, we ensure that AI-driven parsers and search bots can seamlessly interpret, catalog, and query your credentials, boosting your search visibility.",
  },
  {
    question: "Why should I use an online AI resume builder instead of Word or Canva?",
    answer:
      "Many visual editors like Canva export resumes as flat image sheets or contain complex overlapping text grids that confuse Applicant Tracking Systems (ATS) and search engine web crawlers. CViqly utilizes structured, semantic layouts and standard PDF fonts, guaranteeing that indexing bots and candidate database crawlers can read 100% of your career experience and skill keywords.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq section" id="faq">
      <div className="container">
        <div className="section-header">
          <h2>Frequently asked questions</h2>
        </div>

        <div className="faq__list">
          {faqs.map((faq, index) => (
            <div
              className={`faq__item ${openIndex === index ? "faq__item--open" : ""}`}
              key={index}
            >
              <button
                className="faq__question"
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index}
                id={`faq-question-${index}`}
              >
                <span>{faq.question}</span>
                <ClaudePlus size={18} color="#191918" isOpen={openIndex === index} />
              </button>
              <div className="faq__answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .faq {
          background: var(--color-bg-offwhite);
        }

        .faq__list {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        .faq__item {
          border-bottom: 1px solid var(--color-border);
        }

        .faq__question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 0;
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-text);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: opacity var(--transition-fast);
        }

        .faq__question:hover {
          opacity: 0.7;
        }

        .faq__answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease;
        }

        .faq__item--open .faq__answer {
          max-height: 300px;
        }

        .faq__answer p {
          padding: 0 0 20px;
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--color-text-secondary);
        }
      `}</style>
    </section>
  );
}
