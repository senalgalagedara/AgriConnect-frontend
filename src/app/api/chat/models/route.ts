import { NextRequest, NextResponse } from "next/server";

type APIVersion = "v1" | "v1beta";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const apiVersions: APIVersion[] = ["v1", "v1beta"]; // prefer v1 first

  const results: Record<string, any> = {};
  for (const version of apiVersions) {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      results[version] = data;
    } catch (e: any) {
      results[version] = { error: String(e?.message || e) };
    }
  }

  return NextResponse.json(results);
}
