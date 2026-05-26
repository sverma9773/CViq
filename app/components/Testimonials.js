"use client";

import { useState, useEffect, useCallback } from "react";
import { ClaudeStar, ClaudeSparkleSmall } from "./ClaudeIcon";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    text: "CViqly made creating my resume incredibly simple. The real-time preview is a game-changer — I could see exactly how my resume would look as I typed.",
  },
  {
    name: "Alex Johnson",
    role: "Marketing Manager",
    text: "I've tried several resume builders, but this one stands out. The design is elegant and the templates are truly professional. Landed 3 interviews in a week!",
  },
  {
    name: "Maria Rodriguez",
    role: "UX Designer",
    text: "Beautiful interface, intuitive to use, and the PDF output is pixel-perfect. As a designer, I appreciate the attention to detail in every aspect of this tool.",
  },
  {
    name: "James Chen",
    role: "Data Analyst",
    text: "Finally, a resume builder that's actually free with no catches. No watermarks, unlimited downloads — it's almost too good to be true, but it's real!",
  },
  {
    name: "Sarah Williams",
    role: "Product Manager",
    text: "The customization options are fantastic. I could adjust every detail to make my resume stand out while keeping it ATS-friendly. Highly recommended!",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div className="section-header">
          <h2>Loved by job seekers worldwide</h2>
          <p>See what our users have to say about CViqly</p>
        </div>

        <div className="testimonials__carousel">
          {testimonials.map((t, index) => (
            <div
              className={`testimonials__card ${index === active ? "testimonials__card--active" : ""}`}
              key={t.name}
            >
              <div className="testimonials__stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ClaudeStar key={i} size={14} filled={true} />
                ))}
              </div>
              <p className="testimonials__text">&ldquo;{t.text}&rdquo;</p>
              <div className="testimonials__author">
                <div className="testimonials__avatar">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="testimonials__name">{t.name}</div>
                  <div className="testimonials__role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonials__dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`testimonials__dot ${index === active ? "testimonials__dot--active" : ""}`}
              onClick={() => setActive(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .testimonials {
          border-top: 1px solid var(--color-border);
        }

        .testimonials__carousel {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          min-height: 240px;
        }

        .testimonials__card {
          position: absolute;
          inset: 0;
          padding: 32px;
          border-radius: var(--radius-lg);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.4s ease;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .testimonials__card--active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .testimonials__stars {
          display: flex;
          gap: 2px;
          margin-bottom: 16px;
        }

        .testimonials__text {
          font-family: var(--font-display);
          font-size: 1rem;
          line-height: 1.7;
          color: var(--color-text);
          margin-bottom: 20px;
          font-weight: 400;
        }

        .testimonials__author {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .testimonials__avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-text);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.7rem;
        }

        .testimonials__name {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--color-text);
        }

        .testimonials__role {
          font-size: 0.78rem;
          color: var(--color-text-tertiary);
        }

        .testimonials__dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 28px;
        }

        .testimonials__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          background: var(--color-border);
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .testimonials__dot--active {
          background: var(--color-text);
          width: 20px;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .testimonials__carousel {
            min-height: 320px;
          }
          
          .testimonials__card {
            padding: 24px 20px;
          }
          
          .testimonials__text {
            font-size: 1.05rem;
          }
          
          .testimonials__dot {
            width: 8px;
            height: 8px;
            margin: 0 4px;
          }
          
          .testimonials__dot--active {
            width: 24px;
          }
        }
      `}</style>
    </section>
  );
}
