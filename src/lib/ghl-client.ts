import HighLevel from "@gohighlevel/api-client";

export function createGhlClient() {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  if (!token?.trim()) return null;

  return new HighLevel({
    privateIntegrationToken: token.trim(),
    apiVersion: process.env.GHL_API_VERSION?.trim() || "2021-07-28",
  });
}
