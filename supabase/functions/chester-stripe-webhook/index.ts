// Cruzi Chester funnel — Stripe webhook.
// Handles `checkout.session.completed` and flips the matching
// practice_pass_purchases row from pending -> paid.
//
// Idempotent: re-delivery for the same session_id is a no-op because we
// only update rows whose status is still 'pending'.
//
// IMPORTANT: deploy with `--no-verify-jwt`. Stripe's signature is the auth.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method_not_allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing_signature", { status: 400 });

  const rawBody = await req.text();

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("webhook signature verification failed:", err);
    return new Response("invalid_signature", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        // Idempotent: only flip rows still pending.
        const { error } = await supabase
          .from("practice_pass_purchases")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_customer_id: customerId,
          })
          .eq("stripe_checkout_session_id", sessionId)
          .eq("status", "pending");

        if (error) {
          console.error("update purchase to paid failed:", error);
          return new Response("update_failed", { status: 500 });
        }
        break;
      }

      // Optional safety nets — log for now, no side-effects in v1.
      case "checkout.session.expired":
      case "payment_intent.payment_failed":
        console.log(`chester webhook: received ${event.type}, no action (v1)`);
        break;

      default:
        // Unhandled event types are ack'd to avoid retry storms.
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("webhook handler error:", err);
    return new Response("handler_error", { status: 500 });
  }
});
