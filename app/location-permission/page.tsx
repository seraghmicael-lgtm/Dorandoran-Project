import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import { safeInternalPath } from "@/lib/safePath";

export default async function LocationPermissionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextHref = safeInternalPath(next, "/home");

  return (
    <WireframeLayout justify="between" className="p-6">
      <div className="flex-1 flex flex-col justify-center gap-4 py-12">
        <h1 className="text-xl font-bold text-black leading-tight">
          가까운 것만 보여드릴게요
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          걸어서 갈 수 있는 곳만 보여드리려고 위치를 확인해요. 위치는 저장하지 않아요.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8 items-center">
        <Link
          href={nextHref}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          위치 허용하기
        </Link>
      </div>
    </WireframeLayout>
  );
}
