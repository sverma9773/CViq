import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { billingPeriod } = await req.json();

    if (!billingPeriod || (billingPeriod !== "monthly" && billingPeriod !== "yearly")) {
      return NextResponse.json({ error: "Invalid billing period. Must be 'monthly' or 'yearly'." }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 1. Define plan properties based on billing period
    const isMonthly = billingPeriod === "monthly";
    const planName = isMonthly ? "CViqly Pro Monthly Plan" : "CViqly Pro Yearly Plan";
    const planAmount = isMonthly ? 149 * 100 : 999 * 100; // in paise
    const planDescription = isMonthly 
      ? "Recurring monthly access to all CViqly Pro features" 
      : "Recurring yearly access to all CViqly Pro features";

    // 2. Create the plan dynamically in Razorpay
    const plan = await razorpay.plans.create({
      period: isMonthly ? "monthly" : "yearly",
      interval: 1,
      item: {
        name: planName,
        amount: planAmount,
        currency: "INR",
        description: planDescription,
      },
    });

    if (!plan || !plan.id) {
      throw new Error("Failed to create Razorpay Plan");
    }

    // 3. Create the Subscription linked to the Plan
    // total_count is the total number of billing cycles (60 cycles for monthly = 5 years, 5 cycles for yearly = 5 years)
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.id,
      customer_notify: 1,
      total_count: isMonthly ? 60 : 5,
    });

    if (!subscription || !subscription.id) {
      throw new Error("Failed to create Razorpay Subscription");
    }

    // 4. Return subscription details to the client
    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
