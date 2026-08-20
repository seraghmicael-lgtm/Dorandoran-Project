import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import { safeInternalPath } from "@/lib/safePath";

export default async function NotificationPermissionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextHref = safeInternalPath(next, "/welcome");

  return (
    <WireframeLayout justify="between" bottomNav="none" className="p-6">
      <div className="flex-1 flex flex-col justify-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black leading-tight">
          나가실 때 알려드릴게요
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          만나기 30분 전에 알려드려요. 알림은 언제든 끄실 수 있어요.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <Link
          href={nextHref}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          허용
        </Link>
        <Link
          href={nextHref}
          className="w-full h-[60px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
        >
          허용 안함
        </Link>
      </div>
    </WireframeLayout>
  );
}
