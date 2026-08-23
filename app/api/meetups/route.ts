import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UID_COOKIE, UID_COOKIE_ATTRS } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activity, startTime, locationName, lat, lng, maxPeople, message } = body;

    const cookieStore = await cookies();
    const uidCookie = cookieStore.get("uid")?.value;

    let creatorId: string | undefined = undefined;

    if (uidCookie) {
      const existingUser = await prisma.user.findUnique({
        where: { id: uidCookie },
      });
      if (existingUser) {
        creatorId = existingUser.id;
      }
    }

    if (!creatorId) {
      let demoUser = await prisma.user.findFirst();
      if (!demoUser) {
        demoUser = await prisma.user.create({
          data: {
            nickname: "동네주민",
            neighborhood: "송정동",
          },
        });
      }
      creatorId = demoUser.id;
    }

    const meetup = await prisma.meetup.create({
      data: {
        activity: activity || "오일장 구경 같이 하실 분",
        startTime: startTime || "오늘 오후 3시 ~ 4시",
        locationName: locationName || "송정 오일장 · 걸어서 12분",
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
        maxPeople: typeof maxPeople === "number" ? maxPeople : 3,
        message: typeof message === "string" && message.trim() ? message.trim() : null,
        status: "open",
        creatorId: creatorId,
      },
    });

    try {
      await prisma.participant.create({
        data: {
          meetupId: meetup.id,
          userId: creatorId,
        },
      });
    } catch (participantErr) {
      console.warn("Participant auto-add warning:", participantErr);
    }

    // 작성자를 쿠키로 기억해 "만든 동행" 목록에서 내 모임을 찾을 수 있게 한다
    const res = NextResponse.json(meetup, { status: 201 });
    if (uidCookie !== creatorId) {
      res.cookies.set(UID_COOKIE, creatorId, UID_COOKIE_ATTRS);
    }
    return res;
  } catch (error) {
    console.error("Error creating meetup:", error);
    return NextResponse.json(
      { error: "Failed to create meetup" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const meetups = await prisma.meetup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
    return NextResponse.json(meetups);
  } catch (error) {
    console.error("Error fetching meetups:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetups" },
      { status: 500 }
    );
  }
}
