"use client";

import { ClaudeSparkleSmall } from "./ClaudeIcon";

const steps = [
  {
    number: "1",
    title: "Choose a template",
    description: "Select from our collection of professionally designed, ATS-friendly resume templates optimized for search engine scanners.",
  },
  {
    number: "2",
    title: "Add your experience",
    description: "Fill in your career details—education, work history, skills, and accomplishments—using our intuitive CV builder.",
  },
  {
    number: "3",
    title: "Customize layout & design",
    description: "Fine-tune formatting parameters inside our online resume maker until the final document perfectly reflects your personal brand.",
  },
  {
    number: "4",
    title: "Download unlimited PDFs",
    description: "Download your polished, high-fidelity resume as an ATS-compliant PDF, ready to secure job interviews.",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <h2>Create a professional resume in minutes</h2>
          <p>Four simple steps to land your dream job</p>
        </div>

        <div className="how-it-works__grid">
          {steps.map((step) => (
            <div className="how-it-works__card" key={step.number}>
              <div className="how-it-works__card-number">
                <ClaudeSparkleSmall size={10} color="#da7756" />
                <span>{step.number}</span>
              </div>
              <h3 className="how-it-works__card-title">{step.title}</h3>
              <p className="how-it-works__card-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .how-it-works {
          background: var(--color-bg);
          border-top: 1px solid var(--color-border);
        }

        .how-it-works__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--color-border);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .how-it-works__card {
          padding: 32px 24px;
          background: var(--color-bg);
          transition: background var(--transition-base);
        }

        .how-it-works__card:hover {
          background: var(--color-bg-offwhite);
        }

        .how-it-works__card-number {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-accent);
          margin-bottom: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .how-it-works__card-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--color-text);
        }

        .how-it-works__card-desc {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .how-it-works__grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .how-it-works__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
