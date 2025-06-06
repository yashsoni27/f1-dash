import { NextRequest, NextResponse } from "next/server";

export const DHL_ENDPOINTS = {
  pitStopByEvent: `${process.env.NEXT_PUBLIC_DHL_API_BASE}/${process.env.DHL_PITSTOP_EVENT_ID}`,
  avgPitStopAndEventId: `${process.env.NEXT_PUBLIC_DHL_API_BASE}/${process.env.DHL_AVG_PITSTOP_ID}`,
  fastestPitStopAndStanding: `${process.env.NEXT_PUBLIC_DHL_API_BASE}/${process.env.DHL_FASTEST_PITSTOP_ID}`,
  fastestLapStanding: `${process.env.NEXT_PUBLIC_DHL_API_BASE}/${process.env.DHL_FASTEST_LAP_ID}`,
  fastestLapVideo: `${process.env.NEXT_PUBLIC_DHL_API_BASE}/${process.env.DHL_FASTEST_LAP_VID}`,
} as const;

export type DHLEndpoint = keyof typeof DHL_ENDPOINTS;

export async function GET(
  request: NextRequest,
  context: { params: { endpoint: DHLEndpoint } }
) {
  try {
    const params = await context.params;
    const endpoint = params.endpoint;
    const { searchParams } = new URL(request.url);

    // Type check the endpoint
    if (!Object.keys(DHL_ENDPOINTS).includes(endpoint)) {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    const baseUrl = DHL_ENDPOINTS[endpoint as DHLEndpoint];
    const url = searchParams.toString()
      ? `${baseUrl}?${searchParams.toString()}`
      : baseUrl;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: parseInt(process.env.REVALIDATION_TIME || "3600") },
    });

    if (!response.ok) {
      throw new Error(`DHL API error: ${response.status}`);
    }

    const data = await response.json();
    if (endpoint == "fastestLapVideo" || endpoint == "pitStopByEvent") {
      return NextResponse.json(data);
    }
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Failed to fetch DHL data:", error);
    return NextResponse.json(
      { error: "Failed to fetch DHL data" },
      { status: 500 }
    );
  }
}
