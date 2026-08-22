import 'dotenv/config';

const N8N_BASE_URL = process.env.N8N_BASE_URL || "http://localhost:5678";
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;
const N8N_API_KEY = process.env.N8N_API_KEY;

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (N8N_WEBHOOK_SECRET) {
    headers["X-Webhook-Secret"] = N8N_WEBHOOK_SECRET;
  }

  return headers;
};

export const sendWebhook = async (path, payload) => {
  const url = `${N8N_BASE_URL}/webhook/marketia${path}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`n8n webhook (${path}): status ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`n8n no disponible (${path}):`, error.message);
    return null;
  }
};

export const isAvailable = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/healthz`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
};
