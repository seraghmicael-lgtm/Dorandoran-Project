import { NextResponse } from "next/server";
import { getSessionUid } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const uid = await getSessionUid();
    if (!uid) {
      return NextResponse.json({ ok: true, message: "No session uid" });
    }

    const body = await request.json().catch(() => ({}));
    const { lat, lng } = body;

    const numLat = typeof lat === "number" ? lat : parseFloat(lat);
    const numLng = typeof lng === "number" ? lng : parseFloat(lng);

    if (isNaN(numLat) || isNaN(numLng)) {
      return NextResponse.json({ ok: true, message: "Invalid lat/lng" });
    }

    await prisma.user
      .update({
        where: { id: uid },
        data: {
          lat: numLat,
          lng: numLng,
        },
      })
      .catch(() => {
        // uid user not found in DB or other DB error - ignore quietly
      });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
