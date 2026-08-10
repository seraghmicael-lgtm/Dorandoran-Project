import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function AfterMeetupPage() {
  const members = [
    { name: "A 님", role: "오늘 함께하신 분" },
    { name: "B 님", role: "오늘 함께하신 분" },
    { name: "C 님", role: "오늘 함께하신 분" },
    { name: "D 님", role: "오늘 함께하신 분" },
  ];

  return (
    <WireframeLayout className="p-6 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center gap-6 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-black">오늘 어떠셨어요?</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            고마웠던 분께 인사를 전해보세요. 한 분께만 전할 수 있어요.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {members.map((member, idx) => (
            <div
              key={idx}
              className="p-4 border border-gray-300 rounded flex flex-col gap-1 hover:border-black cursor-pointer bg-white"
            >
              <span className="font-bold text-sm text-black">{member.name}</span>
              <span className="text-xs text-gray-500">{member.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <Link
          href="/my-meetups/after/complete"
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          고마웠어요 전하기
        </Link>
        <Link
          href="/feed"
          className="w-full h-[60px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
        >
          건너뛰기
        </Link>
      </div>
    </WireframeLayout>
  );
}
