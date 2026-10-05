import { NextResponse, type NextRequest } from "next/server";
import { isCheckoutSessionId } from "@/lib/payment/next-step";
import { CONFIRMATION_COOKIE } from "../load";

/**
 * Stripe's success_url. Moves the session id into a cookie and redirects to
 * the clean /payment-confirmed, so the URL the analytics tags report never
 * carries it (see CONFIRMATION_COOKIE). A redirect keeps document.referrer
 * pointing at checkout.stripe.com, which the purchase tag checks.
 */
export function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const url = request.nextUrl.clone();
  url.search = "";

  if (!isCheckoutSessionId(sessionId)) {
    url.pathname = "/";
    return NextResponse.redirect(url, 303);
  }

  url.pathname = "/payment-confirmed";
  const response = NextResponse.redirect(url, 303);
  response.cookies.set(CONFIRMATION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/payment-confirmed",
    // Survives reloads and a return visit; the page re-verifies with Stripe
    // on every load, so holding it longer grants nothing.
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
