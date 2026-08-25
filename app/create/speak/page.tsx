import { redirect } from "next/navigation";

// 01_말하기는 와이어프레임_v02의 01_뭐 하실래요(활동)로 대체됨 — 구 링크 호환용.
// "새로 만들기" 진입점이기도 하다 — ?new=1 이 앞서 적어둔 초안을 비운다.
export default function CreateSpeakPage() {
  redirect("/create/activity?new=1");
}
