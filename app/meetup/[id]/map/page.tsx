import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";

export default async function MeetupMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <WireframeLayout className="p-4 flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center pb-2 border-b border-gray-200">
          <Link href={`/meetup/${id}`} className="text-lg font-bold text-black px-1">
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
