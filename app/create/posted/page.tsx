"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import StepFooter, { footerButtonClass } from "@/components/ds/StepFooter";
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

// ds_card(1123:2123) 안의 한 줄 — 14짜리 회색 아이콘 + 12짜리 회색 글씨.
// 홈의 ds/MeetupCard 는 자리수 배지·도보 배지가 붙은 다른 변형이라 여기서 쓰지 않는다.
function CardMetaRow({
  icon,
  children,
  trailing,
}: {
  icon: string;
  children: React.ReactNode;
  /** 아이콘 묶음에서 7만큼 떨어져 붙는 값 — "예상 시간 | 1시간" */
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-[7px]">
      <div className="flex items-center gap-1">
        <Image
          src={icon}
          alt=""
          aria-hidden="true"
          width={14}
          height={14}
          className="size-[14px] shrink-0"
        />
        {children}
      </div>
      {trailing}
    </div>
  );
}

export default function CreatePostedPage() {
  const [meetup, setMeetup] = useState<MeetupData>(DEFAULT_MEETUP);
  const [status, setStatus] = useState<"idle" | "posting" | "success" | "error">("idle");
  const [payload, setPayload] = useState<MeetupPayload | null>(null);
  // clearDraft 전 draft에서 보관 — 게시판 카드 표시용
  const [postedDuration, setPostedDuration] = useState<string | null>(null);

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
    // clearDraft 하기 전에 duration을 로컬 state로 보관해 카드에 표시한다
    setPostedDuration(draft.duration ?? null);
    clearDraft();
    const body = buildPayload(draft);
    setPayload(body);
    submit(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "error") {
    return (
      <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
        <header className="h-[60px] shrink-0 px-2 flex items-center border-b border-[#E5E5E5] bg-white relative">
          <span className="absolute inset-x-0 text-center text-[18px] font-medium leading-[1.5] text-[#171717] pointer-events-none">
            올리는 중 문제가 생겼어요
          </span>
        </header>

        <div className="flex-1 px-4 pt-6">
          <p className="rounded-xl border border-[#F2F2F2] bg-surface p-4 text-[16px] font-medium leading-[1.5] text-[#777777]">
            게시에 실패했어요. 인터넷 연결을 확인하고 다시 시도해주세요.
          </p>
        </div>

        <StepFooter>
          <button
            type="button"
            onClick={() => payload && submit(payload)}
            className={`${footerButtonClass("ink")} cursor-pointer`}
          >
            다시 시도
          </button>
          <Link href="/create/speak" className={footerButtonClass("ghost")}>
            처음부터 다시
          </Link>
        </StepFooter>
      </WireframeLayout>
    );
  }

  // ---- 성공(및 idle) 상태 — UI디자인 CR-08 (1123:2000) ----
  // 프레임 360×800: 상단바 60 · content 632 · ds_step_footer 108(바닥 고정).
  // Figma 좌표(97 / 247 / 450)는 "산책하러 같이 가요"처럼 제목이 한 줄일 때의 값이다.
  // 절대배치로 못 박으면 제목이 두 줄로 넘어가는 순간 카드 아래가 잘려 [다음] 버튼과
  // 맞붙는다 — 실제로 대부분의 동행은 뒤에 "같이 하실 분"이 붙어 두 줄이 된다.
  // 그래서 세 덩어리를 흐름대로 쌓고, 안내문과 카드 사이의 97 만 늘었다 줄었다 하게
  // 둔다. 한 줄짜리 카드에서는 정확히 Figma 좌표가 나오고, 카드가 길어지면 그 틈이
  // 대신 줄어들어 카드는 늘 제자리(아래에서 14)에 온전히 보인다.
  const clock = meetup.startTime.replace(/^오늘\s*/, "").split(" ~ ")[0];
  const [place, walk] = meetup.locationName.split(" · ");

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      {/* ds_navigation_top(1123:2001) — 60px, 좌우 8 안에 48짜리 아이콘 버튼 */}
      <header className="h-[60px] shrink-0 px-2 flex items-center border-b border-[#E5E5E5] bg-white relative">
        <Link
          href="/create/review"
          aria-label="뒤로"
          className="size-12 flex items-center justify-center"
        >
          <Image src="/illust/arrow-back-ios-new.svg" alt="" width={24} height={24} />
        </Link>
        <span className="absolute inset-x-0 text-center text-[18px] font-medium leading-[1.5] text-[#171717] pointer-events-none">
          올렸어요
        </span>
      </header>

      {/* content(1123:2057) — 상단바와 푸터 사이를 채운다 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* illust(1123:2059) — content 위에서 97, 149.425 박스 가운데에 125.517×107.586 그림 */}
        <div className="mt-[97px] mx-auto shrink-0 size-[149.425px] flex items-center justify-center">
          <Image
            src="/illust/posted-illust.svg"
            alt=""
            aria-hidden="true"
            width={126}
            height={108}
            className="w-[125.517px] h-[107.586px]"
            loading="eager"
          />
        </div>

        {/* Frame 186(1123:2060) — 좌우 16, 두 덩어리 사이 16.
            illust 박스 바닥(246.425)에 이어 붙으면 곧 Figma 의 247 이다 */}
        <div className="mt-[0.575px] shrink-0 px-4 flex flex-col gap-4 text-center">
          <p className="text-[28px] font-bold leading-[1.3] tracking-[-0.28px] text-[#171717]">
            올렸어요
          </p>
          {/* 두 문장을 한 줄에 붙이면 길어서 눈이 미끄러진다 — 문장마다 줄을 바꾼다 */}
          <p className="text-[18px] font-medium leading-[1.5] text-[#777777] whitespace-pre-line">
            {"사람이 모이면 알려드릴게요\n안 모이면 조용히 사라져요"}
          </p>
        </div>

        {/* 안내문과 카드 사이의 빈 곳 — 한 줄 카드에서 97(Figma 353→450).
            카드가 길어지면 여기가 줄어 카드를 밀어내지 않는다 */}
        <div className="flex-1" />

        {/* Frame 206(1123:2161) — 좌우 20, 안내문과 카드 사이 8, 푸터까지 14 */}
        <div className="shrink-0 px-5 pb-[14px] flex flex-col gap-2">
          <div className="px-1 flex items-center">
            <p className="text-[16px] font-medium leading-[1.5] text-[#777777]">
              홈에는 이렇게 보여요
            </p>
          </div>

          {/* ds_card(1123:2123) — 패딩 16 · 라운드 12 · 연한 테두리 + 옅은 그림자 */}
          <div className="rounded-xl border border-card-line bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.08)] flex flex-col gap-3">
            <div className="flex flex-col gap-[2px]">
              <p className="text-[16px] font-bold leading-[1.5] text-black">{clock}</p>
              <p className="text-[20px] font-bold leading-[1.3] text-black">{meetup.activity}</p>
            </div>

            <div className="flex flex-col gap-[2px] text-[12px] font-medium leading-[1.5] text-sub">
              {postedDuration && (
                <CardMetaRow icon="/illust/fill-time.svg" trailing={<span>{postedDuration}</span>}>
                  <span>예상 시간</span>
                </CardMetaRow>
              )}
              {place && (
                <CardMetaRow icon="/illust/fill-gps.svg">
                  <span>{place}</span>
                  {walk && (
                    <>
                      <span>∙</span>
                      <span>{walk}</span>
                    </>
                  )}
                </CardMetaRow>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ds_step_footer(1123:2030) — 좌우 16 · 위 40 · 아래 20 */}
      <StepFooter>
        <Link href="/my-meetups/created" className={footerButtonClass("ink")}>
          다음
        </Link>
      </StepFooter>
    </WireframeLayout>
  );
}
