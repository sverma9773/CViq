"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ClaudeCheck, ClaudeSparkleSmall } from "./ClaudeIcon";

export default function ProUpgradeModal({ onClose }) {
  const [billingPeriod, setBillingPeriod] = useState("yearly"); // Default to yearly (best value)
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountPercent }
  const [couponError, setCouponError] = useState("");
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  
  const { user, refreshProStatus } = useAuth();

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
      alert("Please sign in to upgrade to Pro.");
      return;
    }

    setLoading(true);

    // 1. If 100% coupon is applied, bypass Razorpay completely
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
          await setDoc(doc(db, "users", user.uid), {
            isPro: true,
            proSince: Date.now(),
            billingPeriod: "free_promo",
            subscriptionId: "promo_" + appliedCoupon.code.toLowerCase() + "_" + Date.now(),
          }, { merge: true });
          
          await refreshProStatus(user.uid);
          alert("Success! Your coupon was applied and Pro features are unlocked.");
          onClose();
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

    // 2. Standard Razorpay checkout
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    try {
      const subRes = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingPeriod }),
      });
      const subData = await subRes.json();

      if (!subData.subscriptionId) {
        throw new Error("Failed to create subscription: " + (subData.error || ""));
      }

      const options = {
        key: subData.keyId,
        subscription_id: subData.subscriptionId,
        name: "CViq Resume Maker",
        description: `CViq Pro - ${billingPeriod === "monthly" ? "Monthly" : "Yearly"} Subscription`,
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
              await setDoc(doc(db, "users", user.uid), {
                isPro: true,
                proSince: Date.now(),
                billingPeriod: billingPeriod,
                subscriptionId: response.razorpay_subscription_id,
              }, { merge: true });
              
              await refreshProStatus(user.uid);
              alert("Payment successful! You are now a Pro subscriber.");
              onClose();
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <ClaudeSparkleSmall size={22} color="#da7756" className="spin-slow" />
          <h2 className="modal-title">Upgrade to CViq Pro</h2>
          <p className="modal-subtitle">
            You've hit the free tier creation limit. Go Pro to unleash your resume's full potential.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="modal-toggle-container">
          <button
            type="button"
            className={`modal-toggle-btn ${billingPeriod === "monthly" ? "modal-toggle-btn--active" : ""}`}
            onClick={() => setBillingPeriod("monthly")}
            disabled={appliedCoupon}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`modal-toggle-btn ${billingPeriod === "yearly" ? "modal-toggle-btn--active" : ""}`}
            onClick={() => setBillingPeriod("yearly")}
            disabled={appliedCoupon}
          >
            Yearly
            <span className="modal-save-badge">Save 44%</span>
          </button>
        </div>

        <div className="modal-price-block">
          <span className="modal-currency">₹</span>
          <span className="modal-price">
            {appliedCoupon ? "0" : (billingPeriod === "monthly" ? "149" : "999")}
          </span>
          <span className="modal-period">
            {appliedCoupon ? "/ one-time" : (billingPeriod === "monthly" ? "/ month" : "/ year")}
          </span>
        </div>
        <p className="modal-billing-note">
          {appliedCoupon 
            ? "Billed at ₹0. 100% coupon discount applied!" 
            : (billingPeriod === "monthly" 
              ? "Billed monthly. Cancel anytime." 
              : "Billed yearly. Save ₹789/yr.")}
        </p>
        
        <ul className="modal-features-list">
          <li className="modal-feature-item">
            <ClaudeCheck size={14} color="#da7756" />
            <span><strong>Unlimited</strong> Resumes & Cover Letters</span>
          </li>
          <li className="modal-feature-item">
            <ClaudeCheck size={14} color="#da7756" />
            <span>AI Resume Rewriting & Polishing</span>
          </li>
          <li className="modal-feature-item">
            <ClaudeCheck size={14} color="#da7756" />
            <span>All Premium ATS-Friendly Templates</span>
          </li>
          <li className="modal-feature-item">
            <ClaudeCheck size={14} color="#da7756" />
            <span>Priority Server Support & Pro Badge</span>
          </li>
        </ul>

        {/* Coupon Box */}
        <div className="modal-coupon-section">
          <div className="modal-coupon-row">
            <input
              type="text"
              placeholder="ENTER COUPON CODE..."
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponError("");
              }}
              disabled={appliedCoupon || loading}
              className="modal-coupon-input"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="btn btn-outline modal-coupon-remove-btn"
                disabled={loading}
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={verifyingCoupon || !couponCode.trim() || loading}
                className="btn btn-primary modal-coupon-apply-btn"
              >
                {verifyingCoupon ? "..." : "Apply"}
              </button>
            )}
          </div>
          {couponError && <p className="modal-coupon-error">{couponError}</p>}
          {appliedCoupon && (
            <p className="modal-coupon-success">
              ✓ Coupon applied: <strong>{appliedCoupon.code}</strong> (100% OFF)
            </p>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: "24px" }}>
          <button className="btn btn-outline modal-cancel-btn" onClick={onClose} disabled={loading}>
            Maybe Later
          </button>
          <button 
            type="button"
            className="btn btn-accent modal-submit-btn"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? "Processing..." : appliedCoupon ? "Unlock Pro for Free" : "Upgrade Now"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(25, 25, 24, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: fadeIn 0.25s ease;
        }

        .modal-card {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 40px 32px;
          max-width: 440px;
          width: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 30px 60px rgba(25, 25, 24, 0.12);
          animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }

        .modal-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 300;
          color: var(--color-text);
          margin-top: 12px;
          margin-bottom: 8px;
        }

        .modal-subtitle {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        /* sliding pill toggle */
        .modal-toggle-container {
          display: inline-flex;
          background: rgba(229, 226, 217, 0.4);
          padding: 3px;
          border-radius: var(--radius-full);
          margin-bottom: 20px;
          border: 1px solid var(--color-border-light);
        }

        .modal-toggle-btn {
          padding: 6px 18px;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          font-size: 0.78rem;
          font-weight: 500;
          font-family: var(--font-body);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .modal-toggle-btn--active {
          background: var(--color-bg);
          color: var(--color-text);
          box-shadow: 0 3px 8px rgba(25, 25, 24, 0.05);
        }

        .modal-save-badge {
          background: var(--color-accent);
          color: #fff;
          font-size: 0.62rem;
          padding: 1px 6px;
          border-radius: var(--radius-full);
          font-weight: 600;
        }

        .modal-price-block {
          display: flex;
          align-items: baseline;
          margin-bottom: 4px;
        }

        .modal-currency {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 300;
          color: var(--color-text);
          margin-right: 2px;
        }

        .modal-price {
          font-family: var(--font-display);
          font-size: 2.6rem;
          font-weight: 300;
          line-height: 1;
          color: var(--color-text);
        }

        .modal-period {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          margin-left: 4px;
        }

        .modal-billing-note {
          font-size: 0.78rem;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }

        .modal-features-list {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .modal-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--color-text);
        }

        /* Coupon Styling */
        .modal-coupon-section {
          margin-top: 20px;
          border-top: 1px dashed var(--color-border);
          padding-top: 16px;
          text-align: left;
          width: 100%;
        }

        .modal-coupon-row {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .modal-coupon-input {
          flex: 1;
          padding: 6px 12px;
          font-size: 0.82rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          outline: none;
          background: var(--color-bg);
          color: var(--color-text);
          text-transform: uppercase;
        }

        .modal-coupon-input:focus {
          border-color: var(--color-text-secondary);
        }

        .modal-coupon-apply-btn {
          padding: 6px 14px;
          font-size: 0.78rem;
          border-radius: var(--radius-md);
          min-height: auto;
        }

        .modal-coupon-remove-btn {
          padding: 6px 14px;
          font-size: 0.78rem;
          border-radius: var(--radius-md);
          min-height: auto;
          border-color: #d15555;
          color: #d15555;
          background: transparent;
        }

        .modal-coupon-remove-btn:hover {
          background: #fdf3f3;
          opacity: 1;
        }

        .modal-coupon-error {
          font-size: 0.74rem;
          color: #d15555;
          margin-top: 4px;
          font-weight: 500;
        }

        .modal-coupon-success {
          font-size: 0.74rem;
          color: var(--color-success);
          margin-top: 4px;
          font-weight: 500;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
        }

        .modal-cancel-btn {
          width: 100%;
          padding: 10px;
          font-size: 0.85rem;
          border-radius: var(--radius-md);
        }

        .modal-submit-btn {
          width: 100%;
          padding: 10px;
          font-size: 0.85rem;
          border-radius: var(--radius-md);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
