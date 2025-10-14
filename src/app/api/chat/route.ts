import { NextRequest, NextResponse } from "next/server";

type APIVersion = "v1" | "v1beta";

// API route to handle chat requests via Google Gemini using direct REST calls
export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not found. Add GEMINI_API_KEY to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "Invalid request payload. 'message' must be a non-empty string." },
      { status: 400 }
    );
  }

  // API versions to try; prefer v1 first
  const apiVersions: APIVersion[] = ["v1", "v1beta"]; 

  const systemText =
    "You are AgriConnect's help assistant. Answer common questions and guide users on how to use the website: browsing products, adding to cart, checkout, managing orders and deliveries, leaving feedback, and contacting support. Keep answers short, clear, and friendly.";

  // Helper: list available models for a version and return preferred order
  async function listAvailableModels(version: APIVersion): Promise<string[]> {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      // If listing fails, return empty; caller will try fallbacks
      return [];
    }
    const data = (await res.json()) as any;
    const models: Array<any> = data?.models || data?.data || [];
    const allIds = models
      .map((m) => (typeof m?.name === "string" ? String(m.name).split("/").pop() : undefined))
      .filter(Boolean) as string[];
    const supportsGen = models
      .filter((m) => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
      .map((m) => String(m.name).split("/").pop()!);
    // Prefer generateContent-capable models; fall back to all if empty
    const candidates = supportsGen.length ? supportsGen : allIds;
    // Sort with light preference: 1.5-flash, 1.5-pro, 1.0-pro, then others
    const pref = ["1.5-flash", "1.5-pro", "1.0-pro", "pro", "flash"]; // substrings
    candidates.sort((a, b) => {
      const score = (id: string) => pref.findIndex((p) => id.includes(p));
      const sa = score(a);
      const sb = score(b);
      return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb);
    });
    return Array.from(new Set(candidates));
  }

  // Static fallback list if ListModels returns nothing
  const staticFallbackModels = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.0-pro",
    "gemini-pro",
  ];

  let lastErr: any = null;
  for (const version of apiVersions) {
    // Discover models for this version
    let candidateModels: string[] = [];
    try {
      candidateModels = await listAvailableModels(version);
    } catch {
      candidateModels = [];
    }
    if (candidateModels.length === 0) candidateModels = staticFallbackModels;
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
          // Optional system instruction (supported on v1). v1beta will just ignore unknown fields.
          systemInstruction: { role: "system", parts: [{ text: systemText }] },
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          // Node runtime request; Next.js will proxy correctly
        });

        if (!res.ok) {
          const txt = await res.text();
          // Try next candidate when 404 (model not found on this version)
          if (res.status === 404) {
            lastErr = new Error(`404 on ${version}/${model}: ${txt}`);
            continue;
          }
          // For other codes (403, 429, 5xx), surface the error
          throw new Error(`HTTP ${res.status} ${res.statusText}: ${txt}`);
        }

        const data = (await res.json()) as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!text) {
          // Try an alternative field shape just in case
          const alt = data?.candidates?.[0]?.output || data?.text || "";
          if (!alt) {
            throw new Error("Empty response from model.");
          }
          return NextResponse.json({ text: alt, model, apiVersion: version });
        }
        return NextResponse.json({ text, model, apiVersion: version });
      } catch (e: any) {
        lastErr = e;
        // Only continue the loop for 404s handled above; other errors break out
        if (String(e?.message || "").startsWith("HTTP ")) {
          break;
        }
      }
    }
  }

  console.error("Gemini chat failed after trying versions/models:", lastErr);
  const hint =
    "Model not found on attempted API versions. Ensure Generative Language API is enabled for your project, your key has access, and try 'gemini-1.5-flash' on v1. If behind a proxy, ensure HTTPS egress to generativelanguage.googleapis.com is allowed.";
  return NextResponse.json(
    { error: "Failed to generate content.", details: hint },
    { status: 500 }
  );
}
