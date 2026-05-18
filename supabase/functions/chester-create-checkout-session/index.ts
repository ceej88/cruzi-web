// Cruzi Chester funnel — create Stripe Checkout Session for the £9.99
// Family Practice Pass. Inserts a `practice_pass_purchases` row first
// (status=pending) so we always have a server-side trail.
//
// PR4 scope: one-time payment, no subscription, no entitlement logic.
// Webhook (chester-stripe-webhook) flips status -> paid on success.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

// Optional — if unset we fall back to the public site URL.
const PUBLIC_SITE_URL =
  Deno.env.get("CHESTER_PUBLIC_SITE_URL") ?? "https://cruzi.co.uk";

const SOURCE = "chester_waitlist_v1";
const AMOUNT_MINOR = 999; // pence
const CURRENCY = "gbp";
const PRODUCT_NAME = "Cruzi Family Practice Pass";
const PRODUCT_DESC =
  "One-time access to Cruzi's family practice tools. No subscription.";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    // 1) Verify the caller is an authenticated Supabase user
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return json({ error: "unauthorized" }, 401);
    }

    const supabaseUser = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

    const user = userData.user;
    const email = user.email;
    if (!email) return json({ error: "user_has_no_email" }, 400);

    // 2) Service-role client for the privileged insert (RLS is on, no policies)
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: pending, error: insertErr } = await supabase
      .from("practice_pass_purchases")
      .insert({
        user_id: user.id,
        email,
        amount: AMOUNT_MINOR,
        currency: CURRENCY,
        status: "pending",
        source: SOURCE,
      })
      .select("id")
      .single();

    if (insertErr || !pending) {
      console.error("insert pending purchase failed:", insertErr);
      return json({ error: "insert_failed" }, 500);
    }

    // 3) Stripe Checkout Session
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: AMOUNT_MINOR,
            product_data: { name: PRODUCT_NAME, description: PRODUCT_DESC },
          },
        },
      ],
      success_url: `${PUBLIC_SITE_URL}/chester/success?cs={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_SITE_URL}/chester/start?canceled=1`,
      metadata: {
        user_id: user.id,
        purchase_id: pending.id,
        source: SOURCE,
      },
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          purchase_id: pending.id,
          source: SOURCE,
        },
      },
    });

    // 4) Stamp the session id onto the pending row
    const { error: updateErr } = await supabase
      .from("practice_pass_purchases")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", pending.id);

    if (updateErr) {
      console.error("stamp session_id failed:", updateErr);
      // Non-fatal: the session is created. The webhook can still find this
      // row via metadata.purchase_id in a follow-up reconciliation if needed.
    }

    return json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return json({ error: (err as Error).message ?? "unknown" }, 500);
  }
});
