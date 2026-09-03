"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import { MeetupDraft, loadDraft, clearDraft } from "@/lib/draft";

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

function buildPayload(draft: MeetupDraft) {
  const rawTime = draft.time || "오후 3시";
  const rawActivity = draft.activity || "오일장 구경";
  const rawLocation = draft.location || "송정 오일장";

  // 04_얼마나 걸릴까요 화면이 계산해둔 startTime("오늘 오후 3시 ~ 5시")을 그대로 쓴다.
  // 그 화면을 안 거친 경로(01_타이핑 등)는 시작 시각만 표기 — 종료 시각을 지어내지 않는다.
  const dayPrefix = rawTime.includes("오늘") || rawTime.includes("내일") ? "" : "오늘 ";
  const startTime =
    draft.startTime || (rawTime.includes("~") ? rawTime : `${dayPrefix}${rawTime}`);

  const activity = rawActivity.includes("같이 하실 분")
    ? rawActivity
    : `${rawActivity} 같이 하실 분`;

  const locationName = rawLocation.includes("걸어서")
    ? rawLocation
    : `${rawLocation} · 걸어서 12분`;

  return {
    startTime,
    activity,
    locationName,
    ...(typeof draft.maxPeople === "number" ? { maxPeople: draft.maxPeople } : {}),
    ...(typeof draft.duration === "string" && draft.duration.trim()
      ? { duration: draft.duration.trim() }
      : {}),
    ...(typeof draft.goAnyway === "boolean" ? { goAnyway: draft.goAnyway } : {}),
    ...(typeof draft.message === "string" && draft.message.trim()
      ? { message: draft.message.trim() }
      : {}),
    // 장소 검색으로 찾은 좌표 — 상세 화면의 지도·길찾기가 이걸 쓴다
    ...(typeof draft.lat === "number" && typeof draft.lng === "number"
      ? { lat: draft.lat, lng: draft.lng }
      : {}),
  };
}

type MeetupPayload = ReturnType<typeof buildPayload>;

export default function CreatePostedPage() {
  const [meetup, setMeetup] = useState<MeetupData>(DEFAULT_MEETUP);
  const [status, setStatus] = useState<"idle" | "posting" | "success" | "error">("idle");
  const [payload, setPayload] = useState<MeetupPayload | null>(null);
  // clearDraft 전 draft에서 보관 — 게시판 카드 표시용
  const [postedDuration, setPostedDuration] = useState<string | null>(null);
  const [postedMessage, setPostedMessage] = useState<string | null>(null);

  const submit = (body: MeetupPayload) => {
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
    const draft = loadDraft();
    if (!draft) return; // 없거나 깨짐 — 예시 화면 유지
    // clearDraft 하기 전에 duration/message를 로컬 state로 보관해 게시판 카드에 표시한다
    setPostedDuration(draft.duration ?? null);
    setPostedMessage(draft.message ?? null);
    clearDraft();
    const body = buildPayload(draft);
    setPayload(body);
    submit(body);
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

  // ---- 성공(및 idle) 상태 렌더링 — UI디자인 CR-08 (1123:961) ----
  const maxPeople = payload?.maxPeople;

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <header className="h-[60px] px-5 flex items-center border-b border-gray-100 bg-white relative">
        <Link href="/create/review" aria-label="뒤로" className="text-2xl text-black leading-none">
          ‹
        </Link>
        <span className="absolute inset-x-0 text-center text-[17px] font-bold text-black pointer-events-none">
          올렸어요
        </span>
      </header>

      <div className="flex-1 px-[18px] py-[22px] flex flex-col items-center gap-5 text-center">
        {/* ✓ 원형 배지 + 올렸어요 */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-[74px] h-[74px] rounded-full border-2 border-black bg-white flex items-center justify-center">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#171717" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-black">올렸어요</h1>
        </div>

        {/* 회색 안내문 */}
        {/* 두 문장을 한 줄에 붙이면 길어서 눈이 미끄러진다 — 문장마다 줄을 바꾼다 */}
        <p className="text-[15px] text-muted whitespace-pre-line leading-relaxed">
          {"사람이 모이면 알려드릴게요.\n안 모이면 조용히 사라져요."}
        </p>

        {/* 좌측 정렬 섹션 제목 */}
        <div className="w-full text-left">
          <p className="text-[15px] text-muted">홈에는 이렇게 보여요</p>
        </div>

        {/* 게시판 카드 — 회색 테두리, 좌측 정렬 */}
        <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)] flex flex-col gap-1 text-left">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[15px] font-bold text-black">
              {meetup.startTime.replace(/^오늘\s*/, "").split(" ~ ")[0]}
            </span>
            {maxPeople != null && (
              <span className="text-[14px] text-muted">1 / {maxPeople}명</span>
            )}
          </div>
          <p className="text-[19px] font-bold text-black">{meetup.activity}</p>
          {postedDuration && (
            <p className="text-[14px] text-muted">예상 시간 : {postedDuration}</p>
          )}
          <p className="text-[14px] text-muted">{meetup.locationName}</p>
          {postedMessage && (
            <p className="mt-1 text-[14px] text-muted whitespace-pre-line">“{postedMessage}”</p>
          )}
        </div>

        {/* Figma 971:457 "확인버튼" — 검정 배경 · 흰 글씨 · 모서리 둥글게.
            화면 맨 아래에 붙이고, 누르면 방금 올린 동행을 바로 보여준다 */}
        <Link
          href="/my-meetups/created"
          className="mt-auto w-full h-[54px] rounded-lg bg-ink text-white flex items-center justify-center text-[17px] font-bold"
        >
          확인
        </Link>
      </div>
    </WireframeLayout>
  );
}
