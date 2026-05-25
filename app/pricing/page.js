"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { ClaudeCheck, ClaudeSparkleSmall } from "../components/ClaudeIcon";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState("yearly"); // Default to yearly (best value)
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountPercent }
  const [couponError, setCouponError] = useState("");
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  
  const { user, isPro, refreshProStatus, setAuthModalOpen } = useAuth();
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setVerifyingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupon/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountPercent: data.discountPercent,
        });
        setCouponCode("");
      } else {
        setCouponError(data.message || "Invalid coupon code.");
      }
    } catch (err) {
      console.error(err);
      setCouponError("Error validating coupon. Please try again.");
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleUpgrade = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (isPro) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);

    // 1. If a 100% coupon is applied, bypass Razorpay completely
    if (appliedCoupon && appliedCoupon.discountPercent === 100) {
      try {
        const redeemRes = await fetch("/api/coupon/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            couponCode: appliedCoupon.code,
            uid: user.uid,
          }),
        });
        const redeemData = await redeemRes.json();

        if (redeemData.success) {
          await setDoc(
            doc(db, "users", user.uid),
            {
              isPro: true,
              proSince: Date.now(),
              billingPeriod: "free_promo",
              subscriptionId: "promo_" + appliedCoupon.code.toLowerCase() + "_" + Date.now(),
            },
            { merge: true }
          );

          await refreshProStatus(user.uid);
          alert("Success! Your coupon was applied and Pro features are unlocked.");
          router.push("/dashboard");
        } else {
          alert(redeemData.message || "Failed to redeem coupon.");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong redeeming the coupon.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Standard Razorpay subscription checkout
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    try {
      const orderRes = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingPeriod }),
      });
      const orderData = await orderRes.json();

      if (!orderData.subscriptionId) {
        throw new Error("Failed to create subscription: " + (orderData.error || ""));
      }

      const options = {
        key: orderData.keyId,
        subscription_id: orderData.subscriptionId,
        name: "CViqly Resume Maker",
        description: `CViqly Pro - ${billingPeriod === "monthly" ? "Monthly" : "Yearly"} Subscription`,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await setDoc(
                doc(db, "users", user.uid),
                {
                  isPro: true,
                  proSince: Date.now(),
                  billingPeriod: billingPeriod,
                  subscriptionId: response.razorpay_subscription_id,
                },
                { merge: true }
              );

              await refreshProStatus(user.uid);
              alert("Payment successful! You are now a Pro subscriber.");
              router.push("/dashboard");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification error.");
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#da7756",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong initializing subscription checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pricing-page">
        <div className="container pricing__container">
          <div className="pricing__header">
            <h1 className="pricing__title">Simple, transparent pricing</h1>
            <p className="pricing__subtitle">
              Start creating your standout CV for free. Upgrade to unlock powerful AI features and unlimited possibilities.
            </p>

            {/* Toggle Switch */}
            <div className="pricing__toggle-container">
              <button
                type="button"
                className={`pricing__toggle-btn ${billingPeriod === "monthly" ? "pricing__toggle-btn--active" : ""}`}
                onClick={() => setBillingPeriod("monthly")}
                disabled={appliedCoupon}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`pricing__toggle-btn ${billingPeriod === "yearly" ? "pricing__toggle-btn--active" : ""}`}
                onClick={() => setBillingPeriod("yearly")}
                disabled={appliedCoupon}
              >
                Yearly
                <span className="pricing__save-badge">Save 44%</span>
              </button>
            </div>
          </div>

          <div className="pricing__grid">
            {/* Free Plan */}
            <div className="pricing__card">
              <h3 className="pricing__card-title">Free</h3>
              <div className="pricing__price-block">
                <span className="pricing__currency">₹</span>
                <span className="pricing__price">0</span>
                <span className="pricing__period">/ forever</span>
              </div>
              <p className="pricing__card-desc">Perfect for crafting a single professional resume.</p>

              <ul className="pricing__features-list">
                <li className="pricing__feature-item">
                  <span className="pricing__check-icon pricing__check-icon--free">✓</span>
                  <span>1 Resume</span>
                </li>
                <li className="pricing__feature-item">
                  <span className="pricing__check-icon pricing__check-icon--free">✓</span>
                  <span>1 Cover Letter</span>
                </li>
                <li className="pricing__feature-item">
                  <span className="pricing__check-icon pricing__check-icon--free">✓</span>
                  <span>Basic ATS-Friendly Templates</span>
                </li>
                <li className="pricing__feature-item">
                  <span className="pricing__check-icon pricing__check-icon--free">✓</span>
                  <span>PDF & DOCX Export</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="btn btn-outline pricing__cta"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="pricing__card pricing__card--featured">
              <div className="pricing__card-tag">Most Popular</div>
              <h3 className="pricing__card-title">CViqly Pro</h3>
              <div className="pricing__price-block">
                <span className="pricing__currency">₹</span>
                <span className="pricing__price">
                  {appliedCoupon ? "0" : (billingPeriod === "monthly" ? "149" : "999")}
                </span>
                <span className="pricing__period">
                  {appliedCoupon ? "/ one-time" : (billingPeriod === "monthly" ? "/ month" : "/ year")}
                </span>
              </div>
              <p className="pricing__card-desc">
                {appliedCoupon 
                  ? "Billed at ₹0. 100% coupon discount applied!" 
                  : (billingPeriod === "monthly" 
                    ? "Billed monthly. Cancel anytime." 
                    : "Billed annually at ₹999. Save ₹789/year!")}
              </p>

              <ul className="pricing__features-list">
                <li className="pricing__feature-item pricing__feature-item--highlight">
                  <ClaudeCheck size={14} color="#da7756" />
                  <span>Unlimited Resumes</span>
                </li>
                <li className="pricing__feature-item pricing__feature-item--highlight">
                  <ClaudeCheck size={14} color="#da7756" />
                  <span>Unlimited Cover Letters</span>
                </li>
                <li className="pricing__feature-item">
                  <ClaudeCheck size={14} color="#da7756" />
                  <span>AI Resume Rewriting & Polishing</span>
                </li>
                <li className="pricing__feature-item">
                  <ClaudeCheck size={14} color="#da7756" />
                  <span>All Premium & Niche Templates</span>
                </li>
                <li className="pricing__feature-item">
                  <ClaudeCheck size={14} color="#da7756" />
                  <span>Exclusive Pro Badge on Profile</span>
                </li>
                <li className="pricing__feature-item">
                  <ClaudeCheck size={14} color="#da7756" />
                  <span>Priority Server Processing & Support</span>
                </li>
              </ul>

              {/* Coupon Box */}
              <div className="pricing__coupon-section">
                <div className="pricing__coupon-row">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE..."
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError("");
                    }}
                    disabled={appliedCoupon || loading}
                    className="pricing__coupon-input"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="btn btn-outline pricing__coupon-remove-btn"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={verifyingCoupon || !couponCode.trim() || loading}
                      className="btn btn-primary pricing__coupon-apply-btn"
                    >
                      {verifyingCoupon ? "..." : "Apply"}
                    </button>
                  )}
                </div>
                {couponError && <p className="pricing__coupon-error">{couponError}</p>}
                {appliedCoupon && (
                  <p className="pricing__coupon-success">
                    ✓ Coupon applied: <strong>{appliedCoupon.code}</strong> (100% OFF)
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleUpgrade}
                disabled={loading}
                className="btn btn-accent pricing__cta"
                style={{ marginTop: "24px" }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ClaudeSparkleSmall size={14} color="#fff" className="spin-slow" />
                    Processing...
                  </span>
                ) : isPro ? (
                  "You are a Pro Subscriber!"
                ) : appliedCoupon ? (
                  "Unlock Pro for Free"
                ) : (
                  `Upgrade to Pro (${billingPeriod === "monthly" ? "Monthly" : "Yearly"})`
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .pricing-page {
          padding-top: 140px;
          padding-bottom: 100px;
          min-height: 100vh;
          background-color: var(--color-bg-offwhite);
        }

        .pricing__container {
          max-width: 960px;
        }

        .pricing__header {
          text-align: center;
          max-width: 640px;
          margin: 0 auto 56px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pricing__title {
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          margin-bottom: 20px;
          color: var(--color-text);
        }

        .pricing__subtitle {
          font-size: 1rem;
          color: var(--color-text-secondary);
          line-height: 1.65;
          margin-bottom: 36px;
        }

        /* sliding pill toggle */
        .pricing__toggle-container {
          display: inline-flex;
          background: rgba(229, 226, 217, 0.45);
          padding: 4px;
          border-radius: var(--radius-full);
          position: relative;
          border: 1px solid var(--color-border);
        }

        .pricing__toggle-btn {
          padding: 8px 24px;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          font-size: 0.85rem;
          font-weight: 500;
          font-family: var(--font-body);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pricing__toggle-btn--active {
          background: var(--color-bg);
          color: var(--color-text);
          box-shadow: 0 4px 12px rgba(25, 25, 24, 0.05);
        }

        .pricing__save-badge {
          background: var(--color-accent);
          color: #fff;
          font-size: 0.68rem;
          padding: 1px 7px;
          border-radius: var(--radius-full);
          font-weight: 600;
          margin-left: 2px;
        }

        .pricing__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          align-items: stretch;
        }

        .pricing__card {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-base);
          position: relative;
        }

        .pricing__card:hover {
          border-color: var(--color-text-tertiary);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(25, 25, 24, 0.02);
        }

        .pricing__card--featured {
          border: 2px solid var(--color-accent);
          box-shadow: 0 20px 40px rgba(218, 119, 86, 0.06);
        }

        .pricing__card--featured:hover {
          border-color: var(--color-accent);
          transform: translateY(-2px);
          box-shadow: 0 20px 48px rgba(218, 119, 86, 0.08);
        }

        .pricing__card-tag {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-accent);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 4px 16px;
          border-radius: var(--radius-full);
        }

        .pricing__card-title {
          font-family: var(--font-body);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 20px;
        }

        .pricing__price-block {
          display: flex;
          align-items: baseline;
          margin-bottom: 8px;
        }

        .pricing__currency {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 300;
          margin-right: 2px;
          color: var(--color-text);
        }

        .pricing__price {
          font-family: var(--font-display);
          font-size: 3.2rem;
          font-weight: 300;
          line-height: 1;
          color: var(--color-text);
        }

        .pricing__period {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin-left: 6px;
        }

        .pricing__card-desc {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          margin-bottom: 36px;
          min-height: 42px;
        }

        .pricing__features-list {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pricing__feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.88rem;
          color: var(--color-text);
        }

        .pricing__feature-item--highlight {
          font-weight: 500;
        }

        .pricing__check-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .pricing__check-icon--free {
          color: var(--color-success);
        }

        /* Coupon Styling */
        .pricing__coupon-section {
          margin-top: 28px;
          border-top: 1px dashed var(--color-border);
          padding-top: 24px;
          text-align: left;
        }

        .pricing__coupon-row {
          display: flex;
          gap: 8px;
        }

        .pricing__coupon-input {
          flex: 1;
          padding: 8px 12px;
          font-size: 0.85rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          outline: none;
          background: var(--color-bg);
          color: var(--color-text);
          text-transform: uppercase;
        }

        .pricing__coupon-input:focus {
          border-color: var(--color-text-secondary);
        }

        .pricing__coupon-apply-btn {
          padding: 8px 16px;
          font-size: 0.82rem;
          border-radius: var(--radius-md);
          min-height: auto;
        }

        .pricing__coupon-remove-btn {
          padding: 8px 16px;
          font-size: 0.82rem;
          border-radius: var(--radius-md);
          min-height: auto;
          border-color: #d15555;
          color: #d15555;
          background: transparent;
        }

        .pricing__coupon-remove-btn:hover {
          background: #fdf3f3;
          opacity: 1;
        }

        .pricing__coupon-error {
          font-size: 0.78rem;
          color: #d15555;
          margin-top: 6px;
          font-weight: 500;
        }

        .pricing__coupon-success {
          font-size: 0.78rem;
          color: var(--color-success);
          margin-top: 6px;
          font-weight: 500;
        }

        .pricing__cta {
          width: 100%;
          padding: 12px;
          font-size: 0.92rem;
          border-radius: var(--radius-md);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spin-slow {
          animation: spin 3s linear infinite;
        }

        @media (max-width: 768px) {
          .pricing-page {
            padding-top: 110px;
            padding-bottom: 60px;
          }

          .pricing__grid {
            grid-template-columns: 1fr;
            gap: 40px;
            max-width: 440px;
            margin: 0 auto;
          }

          .pricing__card {
            padding: 40px 32px;
          }
        }
      `}</style>
    </>
  );
}
