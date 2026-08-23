import { redirect } from "next/navigation";

// 01_말하기는 와이어프레임_v02의 01_뭐 하실래요(활동)로 대체됨 — 구 링크 호환용
export default function CreateSpeakPage() {
  redirect("/create/activity");
}
