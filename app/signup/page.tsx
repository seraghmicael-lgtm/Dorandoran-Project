"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepScreen from "@/components/ds/StepScreen";
import StepFooter from "@/components/ds/StepFooter";

// UI디자인 on-03 (1083:4112) — 본인 확인
export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (res.ok) router.push("/notification-permission?next=/welcome");
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <StepScreen
      title={"이웃과 함께하려면\n간단한 본인 확인이\n필요해요"}
      subtitle={"이름과 연락처만 확인해요\n다른 정보는 받지 않아요"}
      footer={
        <StepFooter>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full h-[54px] rounded-lg bg-[#F3D74F] text-black flex items-center justify-center text-[17px] font-bold disabled:opacity-60"
          >
            {loading ? "확인하고 있어요..." : "카카오로 시작하기"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/location-permission")}
            disabled={loading}
            className="w-full h-[54px] rounded-lg bg-white text-black border border-gray-300 flex items-center justify-center text-[17px] font-bold disabled:opacity-60"
          >
            이전
          </button>
        </StepFooter>
      }
    >
      {/* 방패 + 사람 + 확인 표시 (on-03 일러스트) */}
      <div className="mt-10 flex items-center justify-center">
        <svg width="136" height="159" viewBox="0 0 136 159" role="img" aria-label="본인 확인">
          <path
            d="M68 2 8 24v56c0 38 26 66 60 77 34-11 60-39 60-77V24L68 2Z"
            fill="#7ED957"
          />
          <circle cx="68" cy="62" r="18" fill="#fff" />
          <path d="M40 108c4-16 15-25 28-25s24 9 28 25H40Z" fill="#fff" />
          <circle cx="106" cy="112" r="24" fill="#F5C93B" />
          <path
            d="M96 112l7 7 14-14"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </StepScreen>
  );
}
