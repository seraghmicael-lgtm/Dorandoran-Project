"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepScreen from "@/components/ds/StepScreen";
import StepFooter, { footerButtonClass } from "@/components/ds/StepFooter";
import { Illust } from "@/components/ds/BrandMark";

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
            className={`${footerButtonClass("kakao")} disabled:opacity-60`}
          >
            {loading ? "확인하고 있어요..." : "카카오로 시작하기"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/location-permission")}
            disabled={loading}
            className={`${footerButtonClass("ghost")} disabled:opacity-60`}
          >
            로그인 없이 시작하기
          </button>
        </StepFooter>
      }
    >
      {/* illust(1237:4700) — 프레임 위에서 382px, 가로 가운데. 제목 블록(137+179.2)
          바로 아래 66px 을 띄우면 그 자리가 된다(제목이 세 줄이라 on-02 와 값이 다르다). */}
      <div className="mt-[66px] flex justify-center">
        <Illust name="shield" box={160} />
      </div>
    </StepScreen>
  );
}
