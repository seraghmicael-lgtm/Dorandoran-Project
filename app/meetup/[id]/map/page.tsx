import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";
import { safeInternalPath } from "@/lib/safePath";

export default async function MeetupMapPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  // from is re-validated by /meetup/[id] itself; here we just carry it through unchanged.
  const detailHref =
    typeof from === "string" && from
      ? `/meetup/${id}?from=${encodeURIComponent(from)}`
      : `/meetup/${id}`;

  return (
    <WireframeLayout className="p-4 flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center pb-2 border-b border-gray-200">
          <Link href={detailHref} className="text-lg font-bold text-black px-1">
            ←
          </Link>
        </div>

        {/* Map Placeholder */}
        <PlaceholderBox height="h-[500px]" className="rounded flex items-center justify-center">
          <span className="text-sm font-bold text-gray-500">map</span>
        </PlaceholderBox>
      </div>

      <div className="py-4">
        <button
          type="button"
          className="w-full h-[60px] bg-black text-white flex items-center justify-center gap-2 rounded text-base font-medium"
        >
          <div className="w-4 h-4 rounded-full border border-white bg-gray-600 inline-block" />
          <span>길찾기</span>
        </button>
      </div>
    </WireframeLayout>
  );
}
