import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { couponCode, uid } = await req.json();

    if (!couponCode || !uid) {
      return NextResponse.json({ success: false, message: "Missing required parameters." }, { status: 400 });
    }

    const formattedCode = couponCode.trim().toUpperCase();

    if (formattedCode === "CVIQLY100") {
      return NextResponse.json({
        success: true,
        message: "Promo verified successfully! Pro access granted.",
      });
    }

    return NextResponse.json({
      success: false,
      message: "Invalid coupon code.",
    }, { status: 400 });
  } catch (error) {
    console.error("Failed to redeem coupon:", error);
    return NextResponse.json({ success: false, message: "Server error redeeming coupon." }, { status: 500 });
  }
}
