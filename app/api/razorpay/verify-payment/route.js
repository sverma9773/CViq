import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_subscription_id, 
      razorpay_signature 
    } = await req.json();

    // For subscriptions: signature is built using payment_id + "|" + subscription_id
    // For orders: signature is built using order_id + "|" + payment_id
    let body = "";
    if (razorpay_subscription_id) {
      body = razorpay_payment_id + "|" + razorpay_subscription_id;
    } else if (razorpay_order_id) {
      body = razorpay_order_id + "|" + razorpay_payment_id;
    } else {
      return NextResponse.json({ success: false, error: "Missing order_id or subscription_id" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Verification failed", error);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
