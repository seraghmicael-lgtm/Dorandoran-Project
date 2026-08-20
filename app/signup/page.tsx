"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (res.ok) {
        router.push("/notification-permission?next=/welcome");
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <WireframeLayout justify="between" bottomNav="none" className="p-6">
      <div className="flex-1 flex flex-col justify-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black leading-tight">
          이웃과 함께하려면 간단한 본인 확인이 필요해요
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          이름과 연락처만 확인해요. 다른 정보는 받지 않아요.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium disabled:opacity-50"
        >
          카카오로 시작하기
        </button>
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium disabled:opacity-50"
        >
          휴대폰 번호로 시작하기
        </button>
        <Link
          href="/home"
          className="w-full h-[60px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
        >
          뒤로
        </Link>
      </div>
    </WireframeLayout>
  );
}
