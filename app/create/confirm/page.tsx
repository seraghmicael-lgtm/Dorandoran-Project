import { redirect } from "next/navigation";

// 03_이렇게 들었어요는 /create/listening 한 페이지로 통합됨 (음성 문답식) — 구 링크 호환용
export default function CreateConfirmPage() {
  redirect("/create/listening");
}
