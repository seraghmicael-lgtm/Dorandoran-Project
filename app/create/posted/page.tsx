"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

interface MeetupData {
  id?: string;
  startTime: string;
  activity: string;
  locationName: string;
}

const DEFAULT_MEETUP: MeetupData = {
  startTime: "오늘 오후 3시 ~ 4시",
  activity: "오일장 구경 같이 하실 분",
  locationName: "송정 오일장 · 걸어서 12분",
};

function buildPayload(draft: { time?: string; location?: string; activity?: string }) {
  const rawTime = draft.time || "오후 3시";
  const rawActivity = draft.activity || "오일장 구경";
  const rawLocation = draft.location || "송정 오일장";

  // ponytail: 종료 시각을 계산할 실제 소요시간 데이터가 없어 "~ 4시"를 지어낼 수 없다.
  // Figma 예시값(오후 3시 ~ 4시)과 일치할 때만 그 문구를 그대로 쓰고, 그 외엔 시작 시각만 보여준다.
  const dayPrefix = rawTime.includes("오늘") || rawTime.includes("내일") ? "" : "오늘 ";
  const startTime = rawTime.includes("~")
    ? rawTime
    : rawTime.includes("3시")
    ? `${dayPrefix}${rawTime} ~ 4시`
    : `${dayPrefix}${rawTime}`;

  const activity = rawActivity.includes("같이 하실 분")
    ? rawActivity
    : `${rawActivity} 같이 하실 분`;

  const locationName = rawLocation.includes("걸어서")
    ? rawLocation
    : `${rawLocation} · 걸어서 12분`;

  return { startTime, activity, locationName };
}

export default function CreatePostedPage() {
  const [meetup, setMeetup] = useState<MeetupData>(DEFAULT_MEETUP);
  const [status, setStatus] = useState<"idle" | "posting" | "success" | "error">("idle");
  const [payload, setPayload] = useState<{ startTime: string; activity: string; locationName: string } | null>(null);

  const submit = (body: { startTime: string; activity: string; locationName: string }) => {
    setStatus("posting");
    fetch("/api/meetups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("POST failed");
        return res.json();
      })
      .then((data) => {
        if (data && data.id) {
          setMeetup({
            id: data.id,
            startTime: data.startTime,
            activity: data.activity,
            locationName: data.locationName,
          });
        }
        setStatus("success");
      })
      .catch((err) => {
        console.error("Failed to post meetup:", err);
        setStatus("error");
      });
  };

  useEffect(() => {
    const rawDraft = sessionStorage.getItem("dorandoran_meetup_draft");
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft);
      sessionStorage.removeItem("dorandoran_meetup_draft");
      const body = buildPayload(draft);
      setPayload(body);
      submit(body);
    } catch (e) {
      console.error("Invalid meetup draft JSON:", e);
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "error") {
    return (
      <WireframeLayout justify="start" className="flex flex-col">
        <header className="h-[65px] px-4 flex items-center justify-center border-b border-gray-200 bg-white">
          <span className="text-base font-medium text-black">올리는 중 문제가 생겼어요</span>
        </header>

        <div className="p-4 flex flex-col items-center gap-6 text-center">
          <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
            게시에 실패했어요. 인터넷 연결을 확인하고 다시 시도해주세요.
          </div>

          <div className="w-full flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={() => payload && submit(payload)}
              className="w-full h-[53px] bg-black text-white flex items-center justify-center rounded text-sm font-medium"
            >
              다시 시도
            </button>
            <Link
              href="/create/speak"
              className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium"
            >
              처음부터 다시
            </Link>
          </div>
        </div>
      </WireframeLayout>
    );
  }

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      {/* Header without back arrow as per spec */}
      <header className="h-[65px] px-4 flex items-center justify-center border-b border-gray-200 bg-white">
        <span className="text-base font-medium text-black">올렸어요</span>
      </header>

      <div className="p-4 flex flex-col items-center gap-6 text-center">
        {/* Check mark badge */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-[74px] h-[74px] rounded-full border-2 border-black bg-white flex items-center justify-center text-2xl font-bold text-black">
            ✓
          </div>
          <h1 className="text-xl font-bold text-black">올렸어요</h1>
        </div>

        {/* Card info */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-white flex flex-col gap-2 text-left">
          <span className="text-xs text-gray-500 font-medium">
            {meetup.startTime}
          </span>
          <h2 className="text-base font-bold text-black">
            {meetup.activity}
          </h2>
          <p className="text-xs text-gray-600">{meetup.locationName}</p>
        </div>

        {/* Notice text */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-600 flex flex-col gap-1 text-center">
          <p>사람이 모이면 알려드릴게요.</p>
          <p>안 모이면 조용히 사라져요. 기록도 안 남아요.</p>
        </div>

        {/* Action buttons */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <Link
            href="/my-meetups/created"
            className="w-full h-[53px] bg-black text-white flex items-center justify-center rounded text-sm font-medium"
          >
            내 동행 보기
          </Link>

          <Link
            href="/home"
            className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium"
          >
            홈으로
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
