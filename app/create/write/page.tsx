"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import { saveDraft } from "@/lib/draft";

export default function CreateWritePage() {
  const router = useRouter();

  const [time, setTime] = useState("오후 3시");
  const [location, setLocation] = useState("우리 아파트 앞");
  const [activity, setActivity] = useState("");

  const [editingTime, setEditingTime] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [inputTime, setInputTime] = useState(time);
  const [inputLocation, setInputLocation] = useState(location);

  const isFormComplete =
    Boolean(time.trim() && location.trim() && activity.trim()) &&
    !editingTime &&
    !editingLocation;

  const handlePost = () => {
    if (!isFormComplete) return;
    const draftData = {
      transcript: `${time}에 ${location}에서 ${activity}`,
      time,
      location,
      activity,
    };
    saveDraft(draftData);
    router.push("/create/posted");
  };

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="손으로 쓰기" backHref="/create/activity" />

      <div className="p-4 flex flex-col items-center gap-5">
        {/* Sentence fill-in box */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-white flex flex-col gap-4 text-left">
          {/* Row 1: Time */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            {editingTime ? (
              <div className="flex items-center gap-1.5 text-sm text-black flex-1 mr-2">
                <span>오늘</span>
                <input
                  type="text"
                  className="px-2 py-1 border border-black rounded text-sm font-bold w-28 focus:outline-none"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  autoFocus
                />
                <span>에</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-black">
                <span>오늘</span>
                <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                  {time}
                </span>
                <span>에</span>
              </div>
            )}
            {editingTime ? (
              <button
                type="button"
                onClick={() => {
                  setTime(inputTime.trim() || time);
                  setEditingTime(false);
                }}
                className="text-xs text-black font-bold underline cursor-pointer"
              >
                완료
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInputTime(time);
                  setEditingTime(true);
                }}
                className="text-xs text-gray-500 underline cursor-pointer"
              >
                고치기
              </button>
            )}
          </div>

          {/* Row 2: Location */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            {editingLocation ? (
              <div className="flex items-center gap-1.5 text-sm text-black flex-1 mr-2">
                <input
                  type="text"
                  className="px-2 py-1 border border-black rounded text-sm font-bold w-full focus:outline-none"
                  value={inputLocation}
                  onChange={(e) => setInputLocation(e.target.value)}
                  autoFocus
                />
                <span>에서</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-black">
                <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                  {location}
                </span>
                <span>에서</span>
              </div>
            )}
            {editingLocation ? (
              <button
                type="button"
                onClick={() => {
                  setLocation(inputLocation.trim() || location);
                  setEditingLocation(false);
                }}
                className="text-xs text-black font-bold underline cursor-pointer"
              >
                완료
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInputLocation(location);
                  setEditingLocation(true);
                }}
                className="text-xs text-gray-500 underline cursor-pointer"
              >
                고치기
              </button>
            )}
          </div>

          {/* Row 3: Input slot for activity */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="무엇을 할까요?"
              className="w-full h-[50px] border border-gray-300 rounded px-3 flex items-center text-sm text-black bg-gray-50 focus:outline-none focus:border-black placeholder:text-gray-400"
            />
            <span className="text-sm font-medium text-black">같이 하실 분</span>
          </div>
        </div>

        {/* Switch back to speech button */}
        <div className="w-full flex flex-col items-center gap-1">
          <Link
            href="/create/listening"
            className="w-full h-[44px] border border-gray-300 bg-white text-black flex items-center justify-center gap-2 rounded text-xs font-medium"
          >
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>다시 말로 할래요</span>
          </Link>
          <span className="text-[11px] text-gray-500">
            말하기가 편하시면 언제든 위 버튼으로 돌아가세요
          </span>
        </div>

        {/* Notice text box */}
        <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-600 flex flex-col gap-1 text-center">
          <p>사람이 안 모이면 조용히 사라져요.</p>
          <p>아무도 모르니 편하게 올려보세요.</p>
        </div>

        {/* Submit button */}
        <div className="w-full pt-1">
          <button
            type="button"
            onClick={handlePost}
            disabled={!isFormComplete}
            className={`w-full h-[52px] flex items-center justify-center rounded text-sm font-medium transition-colors ${
              isFormComplete
                ? "bg-black text-white cursor-pointer hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            올리기
          </button>
        </div>
      </div>
    </WireframeLayout>
  );
}
