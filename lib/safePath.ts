// ponytail: ?from=/?next= 값을 검증 없이 Link href에 쓰면 오픈 리다이렉트가 된다.
// 내부 경로("/"로 시작, "//"로 시작하지 않음)일 때만 허용하고 아니면 fallback으로 떨어진다.
export function safeInternalPath(value: string | string[] | undefined, fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
