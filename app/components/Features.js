"use client";

import { ClaudeCheck, ClaudeSparkleSmall } from "./ClaudeIcon";

const features = [
  {
    title: "Free Forever",
    description: "Your first resume is completely free. No trial period, no credit card, no hidden fees.",
  },
  {
    title: "No Watermarks",
    description: "Your resume is your place to shine. We never brand or watermark your documents.",
  },
  {
    title: "Unlimited Downloads",
    description: "Download your resume as many times as you need. There are no download limits.",
  },
  {
    title: "ATS-Friendly Templates",
    description: "Clean, text-based PDFs that pass through Applicant Tracking Systems effortlessly.",
  },
  {
    title: "Real-Time Preview",
    description: "See your changes instantly as you type. What you see is exactly what you'll get.",
  },
  {
    title: "Privacy First",
    description: "Your data stays yours. We don't share personal information and you can delete it anytime.",
  },
];

export default function Features() {
  return (
    <section className="features section" id="features">
      <div className="container">
        <div className="section-header">
          <h2>Everything you need to stand out</h2>
          <p>Powerful features to help you craft the perfect resume</p>
        </div>

        <div className="features__grid">
          {features.map((feature) => (
            <div className="features__card" key={feature.title}>
              <div className="features__card-header">
                <ClaudeSparkleSmall size={14} color="#da7756" />
                <h3 className="features__card-title">{feature.title}</h3>
              </div>
              <p className="features__card-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features {
          background: var(--color-bg-offwhite);
        }

        .features__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .features__card {
          padding: 28px 24px;
          border-radius: var(--radius-lg);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          transition: border-color var(--transition-base);
        }

        .features__card:hover {
          border-color: var(--color-text-tertiary);
        }

        .features__card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .features__card-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .features__card-desc {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .features__grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .features__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
