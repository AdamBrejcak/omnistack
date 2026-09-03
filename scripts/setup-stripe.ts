import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";

// TODO: finish
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.APP_URL || "https://api.yourdomain.com"; // Production or staging URL

if (!stripeSecretKey) {
  console.error("❌ Error: STRIPE_SECRET_KEY is missing in .env");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

async function automateWebhookSetup() {
  const webhookUrl = `${appUrl}/api/stripe/webhook`;
  const targetEvents: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ];

  try {
    console.log(`🔍 Checking existing Stripe webhooks for ${webhookUrl}...`);
    const existingWebhooks = await stripe.webhookEndpoints.list();
    const existing = existingWebhooks.data.find((w) => w.url === webhookUrl);

    if (existing) {
      console.log(`✅ Webhook already exists for ${webhookUrl} (ID: ${existing.id})`);
      return;
    }

    console.log("🚀 Creating new Stripe Webhook endpoint...");
    const endpoint = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: targetEvents,
      description: "Automated OmniStack Webhook Endpoint",
    });

    console.log(`✅ Webhook created successfully! Secret: ${endpoint.secret}`);

    // Automatically append STRIPE_WEBHOOK_SECRET to .env file
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath) && endpoint.secret) {
      fs.appendFileSync(envPath, `\nSTRIPE_WEBHOOK_SECRET=${endpoint.secret}\n`);
      console.log("📝 Added STRIPE_WEBHOOK_SECRET to .env file automatically.");
    }
  } catch (error: any) {
    console.error("❌ Failed to setup Stripe webhook:", error.message);
  }
}

automateWebhookSetup();