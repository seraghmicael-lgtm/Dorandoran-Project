"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 만든 동행 카드의 취소 버튼 — 서버 컴포넌트 목록 안에서 쓰는 작은 클라이언트 조각.
// 누르면 즉시 취소되고 목록이 새로고침되어 완료 섹션으로 이동한다.
export default function CancelCreatedButton({ meetupId }: { meetupId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleCancel = async () => {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch(`/api/meetups/${meetupId}/cancel`, { method: "POST" });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error("취소 실패:", e);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={pending}
      className={`w-full py-4 bg-white border border-gray-300 rounded-[10px] flex items-center justify-center ${
        pending ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
      }`}
    >
      <span className="text-base font-medium text-black">만든 동행 취소하기</span>
    </button>
  );
}
