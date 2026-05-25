import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { couponCode } = await req.json();

    if (!couponCode) {
      return NextResponse.json({ success: false, message: "Coupon code is required." }, { status: 400 });
    }

    const formattedCode = couponCode.trim().toUpperCase();

    if (formattedCode === "CVIQLY100") {
      return NextResponse.json({
        success: true,
        discountPercent: 100,
        message: "Coupon applied: 100% OFF!",
      });
    }

    return NextResponse.json({
      success: false,
      message: "Invalid coupon code.",
    }, { status: 400 });
  } catch (error) {
    console.error("Failed to verify coupon:", error);
    return NextResponse.json({ success: false, message: "Server error verifying coupon." }, { status: 500 });
  }
}
