export const webhookAuth = (req, res, next) => {
  const secret = req.headers["x-webhook-secret"];
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("N8N_WEBHOOK_SECRET not configured");
    return res.status(500).json({ status: "error", message: "Webhook secret not configured" });
  }

  if (!secret || secret !== expectedSecret) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  next();
};
