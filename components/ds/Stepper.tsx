// UI디자인 stepper(1208:9193) — 6칸 세그먼트 막대. 지나온 칸까지 초록으로 채운다.
export default function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={6}>
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className={`flex-1 h-[6px] rounded-full ${i < step ? "bg-accent" : "bg-gray-100"}`}
        />
      ))}
    </div>
  );
}
